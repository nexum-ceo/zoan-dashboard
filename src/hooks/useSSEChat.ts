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
  isComplete?: boolean; // Track if message is fully received
  metadata?: {
    attachments?: Array<{
      url: string;
      mime_type: string;
      file_name: string;
      file_size: number;
    }>;
    [key: string]: unknown;
  };
};

export type UseSSEChatProps = {
  sseUrl?: string;
  chatId: string;
  initialMessages?: ChatMessage[];
  user_id: string;
  expectedResponseTimeoutMs?: number;
  enableAutoReconnect?: boolean;
  onGameSignal?: () => void;
  attachments?: Array<{
    url: string;
    mime_type: string;
    file_name: string;
    file_size: number;
  }>;
};

const FILTERED_MESSAGE_TYPES = new Set([
  'system',
  'metadata',
  'status',
  'error',
  'event',
  'id',
  'retry',
  'ping',
  'heartbeat',
]);

export function useSSEChat({
  sseUrl,
  chatId,
  user_id,
  initialMessages = [],
  enableAutoReconnect = false,
  onGameSignal,
  attachments = [],
}: UseSSEChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAssistantStreaming, setIsAssistantStreaming] =
    useState<boolean>(false);
  const [isAwaitingDone, setIsAwaitingDone] = useState<boolean>(false);
  const [sseConnected, setSseConnected] = useState<boolean>(false);

  // Refs for connection management
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isReconnectingRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const manualCloseRef = useRef<boolean>(false);
  const autoReconnectEnabledRef = useRef<boolean>(enableAutoReconnect);
  const assistantStreamEndTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageAtRef = useRef<number>(Date.now());
  const scheduleReconnectRef = useRef<(reason?: string) => void>(() => {});
  const onGameSignalRef = useRef<(() => void) | null>(onGameSignal ?? null);
  onGameSignalRef.current = onGameSignal ?? null;

  const RECONNECT_BASE_DELAY = 1000;
  const RECONNECT_MAX_DELAY = 15000;

  // Helper function to clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
    if (assistantStreamEndTimeoutRef.current) {
      clearTimeout(assistantStreamEndTimeoutRef.current);
      assistantStreamEndTimeoutRef.current = null;
    }
  }, []);

  // Helper function to close connection and reset states
  const closeConnection = useCallback(() => {
    try {
      esRef.current?.close();
    } catch {}
    esRef.current = null;
    setSseConnected(false);
    setIsAssistantStreaming(false);
    setIsAwaitingDone(false);
    clearAllTimeouts();

    // Mark the last assistant message as complete when connection closes
    setMessages((prev) => {
      if (
        prev.length > 0 &&
        prev[prev.length - 1].role === ChatRole.ASSISTANT
      ) {
        const updated = [...prev];
        const last = { ...updated[updated.length - 1] };
        last.isComplete = true;
        updated[updated.length - 1] = last;
        return updated;
      }
      return prev;
    });
  }, [clearAllTimeouts]);

  // Helper function to check if message should be filtered
  const shouldFilterMessage = useCallback((data: unknown): boolean => {
    if (!data) return true;

    // Filter by type
    if (typeof data === 'object' && data !== null && 'type' in data) {
      const dataObj = data as Record<string, unknown>;
      if (
        typeof dataObj.type === 'string' &&
        FILTERED_MESSAGE_TYPES.has(dataObj.type)
      ) {
        return true;
      }
    }

    // Filter completion messages
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const dataObj = data as Record<string, unknown>;
      if (dataObj.message === 'Response completed') {
        return true;
      }
    }

    if (typeof data === 'string' && data.includes('"Response completed"')) {
      return true;
    }

    return false;
  }, []);

  // Keep auto-reconnect flag in sync with prop
  useEffect(() => {
    autoReconnectEnabledRef.current = !!enableAutoReconnect;
  }, [enableAutoReconnect]);

  const coerceToString = useCallback((value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
      return String(value);
    if (Array.isArray(value))
      return value
        .map((v) => coerceToString(v))
        .filter((s) => s.trim() !== '')
        .join('\n');
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
      if (Array.isArray((obj as Record<string, unknown>).parts)) {
        return coerceToString((obj as Record<string, unknown>).parts);
      }
    }
    return '';
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (manualCloseRef.current) return;
    if (!autoReconnectEnabledRef.current) return;
    if (!sseUrl || sseUrl.trim() === '') return;
    if (isReconnectingRef.current) return;
    const attempt = reconnectAttemptsRef.current;
    const delay =
      Math.min(
        RECONNECT_BASE_DELAY * Math.pow(2, attempt),
        RECONNECT_MAX_DELAY,
      ) + Math.floor(Math.random() * 300);
    isReconnectingRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      isReconnectingRef.current = false;
      try {
        // Defer to latest setupSSE via ref to avoid circular deps
        if (sseUrl) setupSSERef.current(sseUrl);
      } catch (e) {
        console.error('[SSE] reconnect setup failed', e);
      }
    }, delay);
    reconnectAttemptsRef.current = attempt + 1;
  }, [sseUrl]);

  // Keep a ref to the latest scheduleReconnect
  useEffect(() => {
    scheduleReconnectRef.current = scheduleReconnect;
  }, [scheduleReconnect]);

  const setupSSERef = useRef<(url: string) => void>(() => {});
  const handleSSEDataRef = useRef<(raw: string) => void>(() => {});
  const setupSSE = useCallback((url: string) => {
    if (!url || url.trim() === '') {
      return;
    }

    console.log('[SSE] Setting up SSE connection to:', url);
    setSseConnected(true);
    reconnectAttemptsRef.current = 0;
    lastMessageAtRef.current = Date.now();

    console.log('[SSE] SSE connection established (fetch-based)');
  }, []);

  // Keep a ref to latest setupSSE to avoid dependency cycles
  useEffect(() => {
    setupSSERef.current = setupSSE;
  }, [setupSSE]);

  // Unified SSE data handler (used by EventSource or BroadcastChannel)
  useEffect(() => {
    handleSSEDataRef.current = (raw: string) => {
      lastMessageAtRef.current = Date.now();
      clearAllTimeouts();
      setIsAssistantStreaming(true);

      // Set timeout to reset streaming state
      assistantStreamEndTimeoutRef.current = setTimeout(() => {
        setIsAssistantStreaming(false);
      }, 900);

      const rawData = String(raw);

      // Early visibility for game-signal even if JSON parsing fails later
      if (rawData.includes('"game-signal"')) {
        try {
          console.log('[SSE] raw contains game-signal:', rawData);
          if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
            window.dispatchEvent(new CustomEvent('zoan:game-signal'));
          }
        } catch {}
      }

      // Handle [DONE] signal
      if (rawData.trim() === '[DONE]') {
        console.log('[SSE] [DONE] signal received, stopping streaming');
        closeConnection();
        return;
      }

      // Try to parse as JSON first
      let data: Record<string, unknown> | null = null;
      try {
        data = JSON.parse(rawData);
      } catch {
        // If it's not JSON, check if it looks like JSON but failed to parse
        if (rawData.trim().startsWith('{') && rawData.trim().endsWith('}')) {
          return;
        }
      }

      // Filter out unwanted messages
      if (shouldFilterMessage(data || rawData)) {
        if (data?.message === 'Response completed') {
          console.log('[SSE] Completion message received, closing connection');
          closeConnection();
        }
        return;
      }

      // Only process if there's actual content
      const content = data ? coerceToString(data) : rawData;
      if (!content || content.trim() === '') {
        return;
      }

      const chunk = data ? rawData : rawData;

      try {
        setMessages((prev) => {
          const parsedRecord: Record<string, unknown> | null = data;
          const messageType = parsedRecord?.['type'] as string;

          // Extract text content based on message type
          let textContent = '';
          if (messageType === 'thinking') {
            const title =
              typeof parsedRecord!['title'] === 'string'
                ? (parsedRecord!['title'] as string)
                : '';
            const elapsed =
              typeof parsedRecord!['elapsed'] === 'number'
                ? (parsedRecord!['elapsed'] as number)
                : undefined;
            const contentStr = coerceToString(
              parsedRecord!['content'] ??
                parsedRecord!['text'] ??
                parsedRecord!['reasoning'] ??
                parsedRecord!['thoughts'] ??
                parsedRecord!['message'] ??
                parsedRecord!['body'] ??
                parsedRecord!['data'] ??
                parsedRecord,
            );
            const header = title
              ? `${title}${
                  typeof elapsed === 'number' ? ` -${Math.round(elapsed)}s` : ''
                }`
              : contentStr;
            textContent =
              contentStr && title ? `${header}\n${contentStr}` : header;
          } else if (messageType === 'answer') {
            textContent =
              typeof parsedRecord!['content'] === 'string'
                ? (parsedRecord!['content'] as string)
                : coerceToString(parsedRecord!['content'] ?? parsedRecord);
            if (!textContent || textContent.trim() === '') {
              textContent = ''; // Maintain message structure even for empty chunks
            }
          } else if (
            messageType === 'game_generator' ||
            messageType === 'game-signal'
          ) {
            textContent = coerceToString(
              parsedRecord!['content'] ??
                parsedRecord!['text'] ??
                parsedRecord!['data'] ??
                parsedRecord,
            );
            // Proactively notify listeners when a game-signal arrives,
            // even if there is no textual content in this chunk
            if (messageType === 'game-signal') {
              try {
                console.log('[SSE] game-signal received');
                if (onGameSignalRef.current) onGameSignalRef.current();
                try {
                  // Broadcast a DOM event as a resilient fallback channel
                  if (
                    typeof window !== 'undefined' &&
                    'dispatchEvent' in window
                  ) {
                    window.dispatchEvent(new CustomEvent('zoan:game-signal'));
                  }
                } catch {}
              } catch (e) {
                console.error('[SSE] onGameSignal callback error', e);
              }
            }
            if (!textContent || textContent.trim() === '') {
              return prev; // Skip if no content
            }
          } else {
            const primary =
              parsedRecord && typeof parsedRecord['content'] === 'string'
                ? (parsedRecord['content'] as string)
                : null;
            textContent =
              primary ||
              (parsedRecord ? coerceToString(parsedRecord) : String(chunk));
            if (!textContent || textContent.trim() === '') {
              return prev; // Skip if no content
            }
          }

          // Update existing assistant message or create new one
          if (
            prev.length > 0 &&
            prev[prev.length - 1].role === ChatRole.ASSISTANT
          ) {
            const updated = [...prev];
            const last = { ...updated[updated.length - 1] } as ChatMessage;
            const existingParts = Array.isArray(last.parts)
              ? last.parts.slice()
              : [];

            // Add content to main content for answer and text types
            if (messageType === 'answer' || !messageType) {
              last.content = String(last.content || '') + textContent;
            }

            // Add to parts if there's content (or always for answer to maintain structure)
            if (textContent || messageType === 'answer') {
              existingParts.push({
                type: messageType || 'text',
                text: textContent,
              });
              last.parts = existingParts;
            }

            last.sender_id = null;
            updated[updated.length - 1] = last;
            return updated;
          } else {
            // Create new assistant message
            if (!textContent && messageType !== 'answer') {
              return prev; // Skip if no content (except for answer type)
            }

            const newMsg: ChatMessage = {
              id: Date.now().toString() + '-sse',
              role: ChatRole.ASSISTANT,
              content:
                messageType === 'answer'
                  ? textContent
                  : messageType
                  ? ''
                  : textContent,
              sender_id: null,
              parts: [{ type: messageType || 'text', text: textContent }],
            };
            return [...prev, newMsg];
          }
        });
      } catch (error) {
        console.error('[SSE] Error updating messages:', error);
      }
    };
  }, [clearAllTimeouts, closeConnection, shouldFilterMessage, coerceToString]);

  // Do not auto-connect on mount; connections are opened per message send.
  useEffect(() => {
    manualCloseRef.current = false;
    return () => {
      manualCloseRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      closeConnection();
    };
  }, [closeConnection]);

  // Reset states when chatId changes
  useEffect(() => {
    setIsLoading(false);
    setIsAssistantStreaming(false);
    setSseConnected(false);
    setInput('');
  }, [chatId]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const postMessage = useCallback(
    (text: string): Promise<void> => {
      const requestBody = {
        sender_id: user_id,
        role: ChatRole.USER,
        content: text,
        metadata: {
          ...(attachments.length > 0 && { attachments }),
        },
      };

      // Set SSE as connected when starting the request
      setSseConnected(true);
      lastMessageAtRef.current = Date.now();

      // Use fetch for SSE streaming
      return fetch(`/api/chat/${encodeURIComponent(chatId)}/completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store',
      })
        .then((response) => {
          if (!response.ok) {
            console.error(
              'Response not ok:',
              response.status,
              response.statusText,
            );
            setSseConnected(false);
            setIsAwaitingDone(false);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Handle streaming response
          if (!response.body) {
            console.error('No response body for streaming');
            setSseConnected(false);
            throw new Error('No response body for streaming');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const pump = () => {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  console.log('[SSE] Stream ended, stopping streaming');
                  closeConnection();
                  return;
                }

                // Decode chunk and process
                const chunk = decoder.decode(value, { stream: true });
                // console.log('[SSE] Received chunk:', chunk);
                buffer += chunk;

                // Process complete lines
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmedLine = line.trim();
                  if (trimmedLine) {
                    // Skip event types and only process data lines
                    if (
                      trimmedLine.startsWith('event:') ||
                      trimmedLine.startsWith('id:') ||
                      trimmedLine.startsWith('retry:')
                    ) {
                      continue;
                    }

                    // Only process data lines
                    if (trimmedLine.startsWith('data: ')) {
                      const data = trimmedLine.substring(6);
                      if (data && data.trim() !== '') {
                        handleSSEDataRef.current(data);
                      }
                    }
                  }
                }

                pump();
              })
              .catch((error) => {
                console.error('[SSE] Stream read error:', error);
                console.log('[SSE] Stream error occurred, stopping streaming');
                closeConnection();
                throw error;
              });
          };

          pump();
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          console.log('[SSE] Fetch error occurred, stopping streaming');
          closeConnection();
          throw error;
        });
    },
    [chatId, user_id, closeConnection, attachments],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      sender_id: user_id,
      isComplete: true, // User messages are always complete
      metadata: attachments.length > 0 ? { attachments } : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setIsAwaitingDone(true);
    try {
      await postMessage(input);
    } finally {
      setInput('');
      setIsLoading(false);
    }
  };

  const sendMessageDirect = async (msg: string): Promise<void> => {
    if (!msg.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: ChatRole.USER,
      content: msg,
      sender_id: user_id,
      isComplete: true, // User messages are always complete
      metadata: attachments.length > 0 ? { attachments } : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setIsAwaitingDone(true);
    try {
      await postMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine status for UI
  const status: 'submitted' | 'streaming' | undefined =
    isAwaitingDone || isAssistantStreaming
      ? 'streaming'
      : isLoading
      ? 'submitted'
      : undefined;

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isAssistantStreaming,
    setMessages,
    setInput,
    sseConnected,
    sendMessageDirect,
    postMessage,
    isProcessing: isAwaitingDone || isLoading || isAssistantStreaming,
    isAwaitingDone,
    status,
    // Separate flag for input vs submit
    canType: true, // Always allow typing
    canSubmit: !isAwaitingDone && !isLoading && !isAssistantStreaming, // Only disable submit
  };
}
