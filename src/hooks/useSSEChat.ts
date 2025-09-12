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

export type UseSSEChatProps = {
  sseUrl?: string;
  chatId: string;
  initialMessages?: ChatMessage[];
  user_id: string;
  expectedResponseTimeoutMs?: number;
};

const FILTERED_MESSAGE_TYPES = new Set([
  'completion',
  'system',
  'metadata',
  'status',
  'error',
]);

export function useSSEChat({
  sseUrl,
  chatId,
  user_id,
  initialMessages = [],
  expectedResponseTimeoutMs = 25000,
}: UseSSEChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAssistantStreaming, setIsAssistantStreaming] =
    useState<boolean>(false);
  const esRef = useRef<EventSource | null>(null);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isReconnectingRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const manualCloseRef = useRef<boolean>(false);
  const assistantStreamEndTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageAtRef = useRef<number>(Date.now());
  const scheduleReconnectRef = useRef<(reason?: string) => void>(() => {});

  const RECONNECT_BASE_DELAY = 1000;
  const RECONNECT_MAX_DELAY = 15000;

  const clearResponseTimeout = useCallback(() => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  }, []);

  const armResponseTimeout = useCallback(
    (timeoutMs: number) => {
      clearResponseTimeout();
      if (!timeoutMs || timeoutMs <= 0) return;
      responseTimeoutRef.current = setTimeout(() => {
        try {
          esRef.current?.close();
        } catch {}
      }, timeoutMs);
    },
    [clearResponseTimeout],
  );

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
        setupSSERef.current();
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

  const setupSSERef = useRef<() => void>(() => {});
  const setupSSE = useCallback(() => {
    if (!sseUrl || sseUrl.trim() === '') {
      console.log('[SSE] No valid sseUrl provided, skipping connection');
      return;
    }
    if (esRef.current) {
      try {
        esRef.current.close();
      } catch {}
      esRef.current = null;
    }
    try {
      esRef.current = new EventSource(sseUrl);
    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error);
      setSseConnected(false);
      scheduleReconnectRef.current('create failed');
      return;
    }
    (esRef.current as unknown as { onopen: (() => void) | null }).onopen =
      () => {
        setSseConnected(true);
        reconnectAttemptsRef.current = 0;
        lastMessageAtRef.current = Date.now();
        console.log('[SSE] Connection established');
      };
    (
      esRef.current as unknown as {
        onerror: ((err: MessageEvent) => void) | null;
      }
    ).onerror = (err: MessageEvent) => {
      setSseConnected(false);
      console.error('[SSE] Connection error:', err);
      if (!manualCloseRef.current) scheduleReconnectRef.current('onerror');
    };
    esRef.current.onmessage = (event) => {
      lastMessageAtRef.current = Date.now();
      clearResponseTimeout();
      setIsAssistantStreaming(true);
      if (assistantStreamEndTimeoutRef.current) {
        clearTimeout(assistantStreamEndTimeoutRef.current);
        assistantStreamEndTimeoutRef.current = null;
      }
      assistantStreamEndTimeoutRef.current = setTimeout(() => {
        setIsAssistantStreaming(false);
      }, 900);
      const chunk = (() => {
        const rawData = String(event.data);
        if (rawData.trim().startsWith('{') && rawData.trim().endsWith('}')) {
          try {
            const data = JSON.parse(rawData);
            if (data?.type && FILTERED_MESSAGE_TYPES.has(data.type))
              return null;
            return rawData;
          } catch {
            return rawData;
          }
        }
        return rawData;
      })();
      if (!chunk) return;
      try {
        setMessages((prev) => {
          let parsed: unknown = null;
          try {
            parsed = JSON.parse(chunk);
          } catch {}
          const parsedRecord: Record<string, unknown> | null =
            parsed && typeof parsed === 'object'
              ? (parsed as Record<string, unknown>)
              : null;
          const isThinking =
            !!parsedRecord && parsedRecord['type'] === 'thinking';
          const isGameGenerator =
            !!parsedRecord && parsedRecord['type'] === 'game_generator';
          const isGameSignal =
            !!parsedRecord && parsedRecord['type'] === 'game-signal';
          let textContent: string;
          if (isThinking) {
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
          } else if (isGameGenerator) {
            textContent = coerceToString(
              parsedRecord!['content'] ??
                parsedRecord!['text'] ??
                parsedRecord!['data'] ??
                parsedRecord,
            );
          } else if (isGameSignal) {
            textContent = coerceToString(
              parsedRecord!['content'] ??
                parsedRecord!['text'] ??
                parsedRecord!['data'] ??
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
            } else if (isGameGenerator) {
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              if ((textContent || '').trim() !== '')
                existingParts.push({
                  type: 'game_generator',
                  text: textContent,
                });
              last.parts = existingParts;
            } else if (isGameSignal) {
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              if ((textContent || '').trim() !== '')
                existingParts.push({ type: 'game-signal', text: textContent });
              last.parts = existingParts;
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
            const newMsg: ChatMessage = {
              id: Date.now().toString() + '-sse',
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
        console.error('[SSE] Error updating messages:', error);
      }
    };
  }, [sseUrl, scheduleReconnect, clearResponseTimeout, coerceToString]);

  // Keep a ref to latest setupSSE to avoid dependency cycles
  useEffect(() => {
    setupSSERef.current = setupSSE;
  }, [setupSSE]);

  useEffect(() => {
    if (!sseUrl || sseUrl.trim() === '') return;
    manualCloseRef.current = false;
    setupSSE();
    return () => {
      manualCloseRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (esRef.current) {
        try {
          esRef.current.close();
        } catch {}
        esRef.current = null;
      }
      clearResponseTimeout();
    };
  }, [sseUrl, setupSSE, clearResponseTimeout]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const postMessage = useCallback(
    (text: string) => {
      fetch(`/api/chat/${encodeURIComponent(chatId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          chat_id: chatId,
          content: text,
          sender_id: user_id,
          metadata: {},
        }),
      }).catch(() => {});
      lastMessageAtRef.current = Date.now();
      armResponseTimeout(Number(expectedResponseTimeoutMs || 0));
    },
    [chatId, user_id, expectedResponseTimeoutMs, armResponseTimeout],
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      sender_id: user_id,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    postMessage(input);
    setInput('');
    setIsLoading(false);
  };

  const sendMessageDirect = (msg: string) => {
    if (!msg.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: ChatRole.USER,
      content: msg,
      sender_id: user_id,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    postMessage(msg);
    setIsLoading(false);
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
    sseConnected,
    sendMessageDirect,
    isProcessing: isLoading || isAssistantStreaming,
  };
}
