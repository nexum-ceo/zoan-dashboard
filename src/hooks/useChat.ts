'use client';
import { ChatRole } from '@/types/chat';
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  sender_id: string | null;
  parts?: Array<{ type: string; text?: string }>;
};

export type UseCustomChatProps = {
  wsUrl?: string;
  chatId: string;
  agentId?: string;
  initialMessages?: ChatMessage[];
  wsConnected?: boolean;
  user_id: string;
  // Optional client-side reliability configs
  expectedResponseTimeoutMs?: number; // Force recycle if no server response after sending
  enableIdleRecycle?: boolean; // Periodically recycle idle connections without server ping/pong
  idleRecycleMs?: number; // Recycle when idle longer than this duration
};

// System message types that should be filtered out
const FILTERED_MESSAGE_TYPES = new Set([
  'completion',
  'system',
  'metadata',
  'status',
  'error',
]);

export function useChat({
  wsUrl,
  chatId,
  user_id,
  initialMessages = [],
  expectedResponseTimeoutMs = 25000,
  enableIdleRecycle = false,
  idleRecycleMs = 0,
}: UseCustomChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAssistantStreaming, setIsAssistantStreaming] =
    useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const lastActiveTimeRef = useRef<number>(Date.now());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isReconnectingRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const manualCloseRef = useRef<boolean>(false);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const lastMessageAtRef = useRef<number>(Date.now());
  const setupWebSocketRef = useRef<() => void>(() => {});
  // Await-response watchdog
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const awaitingResponseRef = useRef<boolean>(false);
  const assistantStreamEndTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  // Idle recycle
  const idleRecycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Reconnect/heartbeat config (timeout-only; no active ping)
  const RECONNECT_BASE_DELAY = 1000; // 1s
  const RECONNECT_MAX_DELAY = 15000; // 15s
  const HEARTBEAT_TIMEOUT = 45000; // 45s, consider dead and force close

  // Clear heartbeat timer
  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Detect dead connections via inactivity timeout
  const startHeartbeat = useCallback(() => {
    clearHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (!wsRef.current) return;
      if (wsRef.current.readyState !== WebSocket.OPEN) return;

      // If no message for too long, force close to trigger reconnect
      if (now - lastMessageAtRef.current > HEARTBEAT_TIMEOUT) {
        try {
          wsRef.current.close();
        } catch {}
      }
    }, 5000);
  }, [clearHeartbeat]);

  // Clear expected-response timer
  const clearResponseTimeout = useCallback(() => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  }, []);

  // Arm expected-response timer: if server stays silent too long after sending, recycle
  const armResponseTimeout = useCallback(
    (timeoutMs: number) => {
      clearResponseTimeout();
      if (!timeoutMs || timeoutMs <= 0) return;
      responseTimeoutRef.current = setTimeout(() => {
        if (!awaitingResponseRef.current) return;
        console.log('[WS] Response timeout triggered, resetting states');
        // Reset states when timeout occurs
        setIsLoading(false);
        setIsAssistantStreaming(false);
        awaitingResponseRef.current = false;
        if (!wsRef.current) return;
        if (wsRef.current.readyState !== WebSocket.OPEN) return;
        try {
          wsRef.current.close();
        } catch {}
      }, timeoutMs);
    },
    [clearResponseTimeout],
  );

  // Idle recycle controls
  const clearIdleRecycle = useCallback(() => {
    if (idleRecycleIntervalRef.current) {
      clearInterval(idleRecycleIntervalRef.current);
      idleRecycleIntervalRef.current = null;
    }
  }, []);

  const startIdleRecycle = useCallback(
    (enabled: boolean, idleMs: number) => {
      clearIdleRecycle();
      if (!enabled) return;
      if (!idleMs || idleMs <= 0) return;
      idleRecycleIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const idleForMs = now - lastMessageAtRef.current;
        const isVisible = typeof document !== 'undefined' && !document.hidden;
        const isOnline =
          typeof navigator === 'undefined' ||
          typeof navigator.onLine === 'undefined'
            ? true
            : navigator.onLine;
        if (!wsRef.current) return;
        if (wsRef.current.readyState !== WebSocket.OPEN) return;
        if (!isVisible || !isOnline) return;
        if (idleForMs >= idleMs) {
          try {
            wsRef.current.close();
          } catch {}
        }
      }, 5000);
    },
    [clearIdleRecycle],
  );

  // Extract human-readable text from various payload shapes
  const coerceToString = useCallback((value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
      return String(value);
    if (Array.isArray(value)) {
      return value
        .map((v) => coerceToString(v))
        .filter((s) => s.trim() !== '')
        .join('\n');
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const candidateKeys = [
        'content',
        'text',
        'reasoning',
        'thoughts',
        'message',
        'body',
        'data',
      ];
      for (const key of candidateKeys) {
        if (key in obj) {
          const result = coerceToString(obj[key]);
          if (result.trim() !== '') return result;
        }
      }
      // Special case: parts array
      if (Array.isArray(obj.parts)) {
        return coerceToString(obj.parts);
      }
    }
    return '';
  }, []);

  // Schedule reconnect with exponential backoff + jitter
  const scheduleReconnect = useCallback(
    (reason?: string) => {
      if (manualCloseRef.current) return;
      if (!wsUrl || wsUrl.trim() === '') return;
      if (isReconnectingRef.current) return;

      // If offline, wait for online to try again
      if (
        typeof window !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        'onLine' in navigator &&
        navigator.onLine === false
      ) {
        console.log('[WS] Offline, waiting for network to reconnect');
        return;
      }

      const attempt = reconnectAttemptsRef.current;
      const delay =
        Math.min(
          RECONNECT_BASE_DELAY * Math.pow(2, attempt),
          RECONNECT_MAX_DELAY,
        ) + Math.floor(Math.random() * 300);

      isReconnectingRef.current = true;
      console.log('[WS] Scheduling reconnect in', delay, 'ms. Reason:', reason);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        isReconnectingRef.current = false;
        // Attempt to create a new connection via ref to avoid circular deps
        try {
          setupWebSocketRef.current();
        } catch (e) {
          console.error('[WS] setupWebSocket call failed in reconnect', e);
        }
      }, delay);

      reconnectAttemptsRef.current = attempt + 1;
    },
    [wsUrl],
  );

  // Create and wire a websocket connection
  const setupWebSocket = useCallback(() => {
    if (!wsUrl || wsUrl.trim() === '') {
      console.log('[WS] No valid wsUrl provided, skipping connection');
      return;
    }

    // Close any existing connection first
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    try {
      wsRef.current = new WebSocket(wsUrl);
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
      setWsConnected(false);
      scheduleReconnect('create websocket failed');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-error',
          role: ChatRole.ASSISTANT,
          content:
            '⚠️ Agent is experiencing an error. Please check your connection and try again.',
          sender_id: null,
        },
      ]);
      return;
    }

    wsRef.current.onopen = () => {
      setWsConnected(true);
      reconnectAttemptsRef.current = 0;
      lastMessageAtRef.current = Date.now();
      lastActiveTimeRef.current = Date.now();
      startHeartbeat();
      // Start/refresh idle recycle if enabled
      startIdleRecycle(Boolean(enableIdleRecycle), Number(idleRecycleMs || 0));
      console.log('[WS] Connection established');
    };

    wsRef.current.onclose = (event) => {
      setWsConnected(false);
      clearHeartbeat();
      clearIdleRecycle();
      // Reset loading states when connection closes
      setIsLoading(false);
      setIsAssistantStreaming(false);
      awaitingResponseRef.current = false;
      clearResponseTimeout();
      console.log('[WS] Connection closed:', event.code, event.reason);
      if (!manualCloseRef.current && event.code !== 1000) {
        scheduleReconnect('onclose');
      }
    };

    wsRef.current.onerror = (err) => {
      setWsConnected(false);
      clearHeartbeat();
      clearIdleRecycle();
      // Reset loading states when connection errors
      setIsLoading(false);
      setIsAssistantStreaming(false);
      awaitingResponseRef.current = false;
      clearResponseTimeout();
      console.error('[WS] Connection error:', err);
      if (!manualCloseRef.current) {
        scheduleReconnect('onerror');
      }
    };

    wsRef.current.onmessage = (event) => {
      lastMessageAtRef.current = Date.now();
      // Any server activity cancels the expected-response watchdog
      awaitingResponseRef.current = false;
      clearResponseTimeout();
      // Mark assistant as streaming and debounce end state so UI timer works
      setIsAssistantStreaming(true);
      if (assistantStreamEndTimeoutRef.current) {
        clearTimeout(assistantStreamEndTimeoutRef.current);
        assistantStreamEndTimeoutRef.current = null;
      }
      assistantStreamEndTimeoutRef.current = setTimeout(() => {
        setIsAssistantStreaming(false);
        // Clear loading state only when assistant completely finishes streaming
        setIsLoading(false);
      }, 900);
      const chunk = (() => {
        const rawData = String(event.data);

        // Check if it's JSON by looking for JSON indicators
        if (rawData.trim().startsWith('{') && rawData.trim().endsWith('}')) {
          try {
            const data = JSON.parse(rawData);

            if (data?.type && FILTERED_MESSAGE_TYPES.has(data.type)) {
              console.log('[WS] Filtered system message:', data);
              return null;
            }
            console.log('data: ', data);

            // For any other JSON message, return the raw JSON string and
            // let the downstream parser handle types (thinking/text/etc.)
            return rawData;
          } catch (err) {
            // JSON-like but invalid, return raw data
            console.warn('[WS] Invalid JSON structure, err: ', err);
            return rawData;
          }
        }

        // For streaming text chunks (most common case)
        return rawData;
      })();

      if (!chunk) return;

      try {
        setMessages((prev) => {
          // Try to parse the incoming chunk as JSON to inspect type/content
          let parsed: unknown = null;
          try {
            parsed = JSON.parse(chunk);
          } catch {}

          const parsedRecord: Record<string, unknown> | null =
            parsed && typeof parsed === 'object'
              ? (parsed as Record<string, unknown>)
              : null;
          const isThinking =
            !!parsedRecord &&
            typeof parsedRecord['type'] === 'string' &&
            parsedRecord['type'] === 'thinking';
          const isGameGenerator =
            !!parsedRecord &&
            typeof parsedRecord['type'] === 'string' &&
            parsedRecord['type'] === 'game_generator';
          const isGameSignal =
            !!parsedRecord &&
            typeof parsedRecord['type'] === 'string' &&
            parsedRecord['type'] === 'game-signal';
          let textContent: string;
          if (isThinking) {
            const title =
              parsedRecord && typeof parsedRecord['title'] === 'string'
                ? (parsedRecord['title'] as string)
                : '';
            const elapsed =
              parsedRecord && typeof parsedRecord['elapsed'] === 'number'
                ? (parsedRecord['elapsed'] as number)
                : undefined;
            const contentStr = coerceToString(
              (parsedRecord as Record<string, unknown>)['content'] ??
                (parsedRecord as Record<string, unknown>)['text'] ??
                (parsedRecord as Record<string, unknown>)['reasoning'] ??
                (parsedRecord as Record<string, unknown>)['thoughts'] ??
                (parsedRecord as Record<string, unknown>)['message'] ??
                (parsedRecord as Record<string, unknown>)['body'] ??
                (parsedRecord as Record<string, unknown>)['data'] ??
                parsedRecord,
            );
            const header = title
              ? `${title}${
                  typeof elapsed === 'number' ? ` -${Math.round(elapsed)}s` : ''
                }`
              : contentStr;
            // If both title and content exist, combine with newline to create a block under the header
            textContent =
              contentStr && title ? `${header}\n${contentStr}` : header;
          } else if (isGameGenerator) {
            textContent = coerceToString(
              (parsedRecord as Record<string, unknown>)['content'] ??
                (parsedRecord as Record<string, unknown>)['text'] ??
                (parsedRecord as Record<string, unknown>)['data'] ??
                parsedRecord,
            );
          } else if (isGameSignal) {
            textContent = coerceToString(
              (parsedRecord as Record<string, unknown>)['content'] ??
                (parsedRecord as Record<string, unknown>)['text'] ??
                (parsedRecord as Record<string, unknown>)['data'] ??
                parsedRecord,
            );
          } else {
            const primary =
              parsedRecord && typeof parsedRecord['content'] === 'string'
                ? (parsedRecord['content'] as string)
                : null;
            if (primary !== null) {
              textContent = primary;
            } else if (parsedRecord) {
              const alt = coerceToString(parsedRecord);
              textContent = alt.trim() !== '' ? alt : String(chunk);
            } else {
              textContent = typeof chunk === 'string' ? chunk : String(chunk);
            }
          }

          if (
            prev.length > 0 &&
            prev[prev.length - 1].role === ChatRole.ASSISTANT
          ) {
            const updated = [...prev];
            const last = { ...updated[updated.length - 1] } as ChatMessage;

            if (isThinking) {
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              existingParts.push({ type: 'thinking', text: textContent });
              last.parts = existingParts;
              // Do not append thinking to visible assistant content
            } else if (isGameGenerator) {
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              if ((textContent || '').trim() !== '') {
                existingParts.push({
                  type: 'game_generator',
                  text: textContent,
                });
              }
              last.parts = existingParts;
              // Do not append game_generator to visible assistant content
            } else if (isGameSignal) {
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              if ((textContent || '').trim() !== '') {
                existingParts.push({
                  type: 'game-signal',
                  text: textContent,
                });
              }
              last.parts = existingParts;
              // Do not append game-signal to visible assistant content
            } else {
              last.content = String(last.content || '') + textContent;
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              existingParts.push({ type: 'text', text: textContent });
              last.parts = existingParts;
            }

            last.sender_id = null;
            updated[updated.length - 1] = last;
            return updated;
          } else {
            // Start a new assistant message
            const newMsg: ChatMessage = {
              id: Date.now().toString() + '-ws',
              role: ChatRole.ASSISTANT,
              content:
                isThinking || isGameGenerator || isGameSignal
                  ? ''
                  : textContent,
              sender_id: null,
              parts: isThinking
                ? [{ type: 'thinking', text: textContent }]
                : isGameGenerator
                ? [{ type: 'game_generator', text: textContent }]
                : isGameSignal
                ? [{ type: 'game-signal', text: textContent }]
                : [{ type: 'text', text: textContent }],
            };
            return [...prev, newMsg];
          }
        });
      } catch (error) {
        console.error('[WS] Error updating messages:', error);
        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '-error',
            role: ChatRole.ASSISTANT,
            content:
              '⚠️ Agent is experiencing an error. Please try refreshing the page.',
            sender_id: null,
          },
        ]);
      }
    };
  }, [
    wsUrl,
    scheduleReconnect,
    startHeartbeat,
    clearHeartbeat,
    startIdleRecycle,
    clearIdleRecycle,
    clearResponseTimeout,
    coerceToString,
    enableIdleRecycle,
    idleRecycleMs,
  ]);

  // Keep a stable ref to the latest setupWebSocket implementation
  useEffect(() => {
    setupWebSocketRef.current = setupWebSocket;
  }, [setupWebSocket]);

  // Initial connection - only create once when component mounts
  useEffect(() => {
    if (!wsUrl || wsUrl.trim() === '') {
      console.log('[WS] No valid wsUrl provided, skipping connection');
      return;
    }

    console.log('[WS] Initial connection to:', wsUrl);
    manualCloseRef.current = false;
    setupWebSocket();

    return () => {
      console.log('[WS] Component unmounting, closing connection');
      manualCloseRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      clearHeartbeat();
      clearResponseTimeout();
      clearIdleRecycle();

      if (wsRef.current) {
        try {
          wsRef.current.close(1000);
        } catch {}
        wsRef.current = null;
      }
    };
  }, [
    wsUrl,
    setupWebSocket,
    clearHeartbeat,
    clearResponseTimeout,
    clearIdleRecycle,
  ]);

  // Handle page visibility + user activity to keep timestamps fresh and trigger reconnect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden - just update last active time, don't close connection
        lastActiveTimeRef.current = Date.now();
      } else {
        // Tab visible - if not connected, try reconnect shortly
        setTimeout(() => {
          if (!wsConnected && !isReconnectingRef.current) {
            scheduleReconnect('tab visible');
          }
        }, 500);
      }
    };

    // Track user activity to update last active time
    const handleUserActivity = () => {
      lastActiveTimeRef.current = Date.now();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track user activity
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    document.addEventListener('touchstart', handleUserActivity);

    // Network online/offline handling
    const handleOnline = () => {
      if (!wsConnected) {
        scheduleReconnect('network online');
      }
    };
    const handleOffline = () => {
      setWsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [scheduleReconnect, wsConnected]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Prevent sending new messages while assistant is processing
    if (isLoading || isAssistantStreaming) {
      console.log('[Chat] Message blocked: assistant is still processing');
      return;
    }

    // Check if WebSocket is connected
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('[Chat] Message blocked: WebSocket not connected');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      sender_id: user_id,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      wsRef.current.send(
        JSON.stringify({
          role: 'user',
          chat_id: chatId,
          content: input,
          sender_id: user_id,
          metadata: {},
        }),
      );
      // Arm expected-response watchdog
      awaitingResponseRef.current = true;
      lastMessageAtRef.current = Date.now();
      armResponseTimeout(Number(expectedResponseTimeoutMs || 0));
    } catch (error) {
      console.error('[Chat] Failed to send message:', error);
      setIsLoading(false);
      return;
    }

    setInput('');
  };

  // Send message directly via WebSocket
  const sendMessageDirect = (msg: string) => {
    if (!msg.trim()) return;

    // Prevent sending new messages while assistant is processing
    if (isLoading || isAssistantStreaming) {
      console.log(
        '[Chat] Direct message blocked: assistant is still processing',
      );
      return;
    }

    // Check if WebSocket is connected
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('[Chat] Direct message blocked: WebSocket not connected');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: ChatRole.USER,
      content: msg,
      sender_id: user_id,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      wsRef.current.send(
        JSON.stringify({
          role: 'user',
          chat_id: chatId,
          content: msg,
          sender_id: user_id,
          metadata: {},
        }),
      );
      // Arm expected-response watchdog
      awaitingResponseRef.current = true;
      lastMessageAtRef.current = Date.now();
      armResponseTimeout(Number(expectedResponseTimeoutMs || 0));
    } catch (error) {
      console.error('[Chat] Failed to send direct message:', error);
      setIsLoading(false);
      return;
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isAssistantStreaming,
    setMessages,
    setInput,
    wsConnected,
    sendMessageDirect,
    // Helper to check if currently processing (useful for UI state)
    // isLoading: true from send until assistant starts responding
    // isAssistantStreaming: true while assistant is actively streaming
    isProcessing: isLoading || isAssistantStreaming,
    // Debug helpers (remove in production)
    _debug: {
      isLoading,
      isAssistantStreaming,
      wsConnected,
      wsReadyState: wsRef.current?.readyState ?? 'null',
      awaitingResponse: awaitingResponseRef.current,
    },
  };
}
