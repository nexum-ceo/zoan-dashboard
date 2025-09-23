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
  enableAutoReconnect?: boolean;
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
}: UseSSEChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAssistantStreaming, setIsAssistantStreaming] =
    useState<boolean>(false);
  // Strict gating: block input until SSE emits [DONE] or completion
  const [isAwaitingDone, setIsAwaitingDone] = useState<boolean>(false);
  const esRef = useRef<EventSource | null>(null);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Broadcast to other tabs if needed (currently unused)
  // const bcRef = useRef<BroadcastChannel | null>(null);
  // const isOwnerRef = useRef<boolean>(false);
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

  const RECONNECT_BASE_DELAY = 1000;
  const RECONNECT_MAX_DELAY = 15000;

  // Keep auto-reconnect flag in sync with prop
  useEffect(() => {
    autoReconnectEnabledRef.current = !!enableAutoReconnect;
  }, [enableAutoReconnect]);

  const clearResponseTimeout = useCallback(() => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  }, []);

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
        const rawData = String(raw);
        // console.log('[SSE] Processing chunk:', rawData);

        // Handle [DONE] signal
        if (rawData.trim() === '[DONE]') {
          console.log('[SSE] [DONE] signal received, stopping streaming');
          try {
            esRef.current?.close();
          } catch {}
          esRef.current = null;
          setSseConnected(false);
          setIsAssistantStreaming(false);
          setIsAwaitingDone(false);
          // Clear any pending timeouts
          if (assistantStreamEndTimeoutRef.current) {
            clearTimeout(assistantStreamEndTimeoutRef.current);
            assistantStreamEndTimeoutRef.current = null;
          }
          return null;
        }

        // Handle completion message - filter it out from UI
        if (rawData.includes('"message": "Response completed"')) {
          console.log('[SSE] Completion message received, closing connection');
          try {
            esRef.current?.close();
          } catch {}
          esRef.current = null;
          setSseConnected(false);
          setIsAssistantStreaming(false);
          setIsAwaitingDone(false);
          // Clear any pending timeouts
          if (assistantStreamEndTimeoutRef.current) {
            clearTimeout(assistantStreamEndTimeoutRef.current);
            assistantStreamEndTimeoutRef.current = null;
          }
          return null;
        }

        // Try to parse as JSON first
        try {
          const data = JSON.parse(rawData);

          // Filter out unwanted message types
          if (data?.type && FILTERED_MESSAGE_TYPES.has(data.type)) {
            return null;
          }

          // Filter out completion messages
          if (data?.message === 'Response completed') {
            console.log('[SSE] Filtering out completion message from UI');
            return null;
          }

          // Only return data that has actual content
          const content = coerceToString(data);
          if (!content || content.trim() === '') {
            return null;
          }

          return rawData;
        } catch {
          // If it's not JSON, check if it looks like JSON but failed to parse
          if (rawData.trim().startsWith('{') && rawData.trim().endsWith('}')) {
            return null;
          }

          // Filter out raw completion messages
          if (rawData.includes('"Response completed"')) {
            console.log('[SSE] Filtering out raw completion message from UI');
            return null;
          }

          // Only return non-empty raw text
          if (!rawData || rawData.trim() === '') {
            return null;
          }

          return rawData;
        }
      })();
      if (!chunk) {
        return;
      }
      const isDone = chunk.trim() === '[DONE]';

      // Handle completion event to close connection
      if (isDone) {
        console.log(
          '[SSE] [DONE] signal received in chunk processing, stopping streaming',
        );
        try {
          esRef.current?.close();
        } catch {}
        esRef.current = null;
        setSseConnected(false);
        setIsAssistantStreaming(false);
        setIsAwaitingDone(false);
        // Clear any pending timeouts
        if (assistantStreamEndTimeoutRef.current) {
          clearTimeout(assistantStreamEndTimeoutRef.current);
          assistantStreamEndTimeoutRef.current = null;
        }
        return;
      }

      try {
        // Force a re-render to show streaming state
        setIsAssistantStreaming(true);

        setMessages((prev) => {
          let parsed: unknown = null;
          try {
            parsed = JSON.parse(chunk);
          } catch {
            // Ignore parse errors
          }
          const parsedRecord: Record<string, unknown> | null =
            parsed && typeof parsed === 'object'
              ? (parsed as Record<string, unknown>)
              : null;

          const isThinking =
            !!parsedRecord && parsedRecord['type'] === 'thinking';
          const isAnswer = !!parsedRecord && parsedRecord['type'] === 'answer';
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
          } else if (isAnswer) {
            // For answer type, directly get content field
            textContent =
              typeof parsedRecord!['content'] === 'string'
                ? parsedRecord!['content']
                : coerceToString(parsedRecord!['content'] ?? parsedRecord);
            // For answer type, we should process even empty chunks to maintain message structure
            if (!textContent || textContent.trim() === '') {
              textContent = ''; // Set to empty string instead of returning
            }
          } else if (isGameGenerator) {
            textContent = coerceToString(
              parsedRecord!['content'] ??
                parsedRecord!['text'] ??
                parsedRecord!['data'] ??
                parsedRecord,
            );
            // Only process if there's actual content to show
            if (!textContent || textContent.trim() === '') {
              return prev;
            }
          } else if (isGameSignal) {
            textContent = coerceToString(
              parsedRecord!['content'] ??
                parsedRecord!['text'] ??
                parsedRecord!['data'] ??
                parsedRecord,
            );
            // Only process if there's actual content to show
            if (!textContent || textContent.trim() === '') {
              return prev;
            }
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
            // Only process if there's actual content to show
            if (!textContent || textContent.trim() === '') {
              return prev;
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
            } else if (isAnswer) {
              last.content = String(last.content || '') + textContent;
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              // For answer type, always add to parts to maintain structure
              // Even if textContent is empty, we need to maintain the answer part
              existingParts.push({ type: 'answer', text: textContent });
              last.parts = existingParts;
            } else if (isGameGenerator) {
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              // Only add parts with actual content
              if (textContent && textContent.trim() !== '') {
                existingParts.push({
                  type: 'game_generator',
                  text: textContent,
                });
                last.parts = existingParts;
              }
            } else if (isGameSignal) {
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              // Only add parts with actual content
              if (textContent && textContent.trim() !== '') {
                existingParts.push({ type: 'game-signal', text: textContent });
                last.parts = existingParts;
              }
            } else {
              last.content = String(last.content || '') + textContent;
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              // Only add parts with actual content
              if (textContent && textContent.trim() !== '') {
                existingParts.push({ type: 'text', text: textContent });
                last.parts = existingParts;
              }
            }
            last.sender_id = null;
            updated[updated.length - 1] = last;
            return updated;
          } else {
            // For answer type, create message even if first chunk is empty
            // For other types, only create if there's actual content
            if (!isAnswer && (!textContent || textContent.trim() === '')) {
              return prev;
            }
            const newMsg: ChatMessage = {
              id: Date.now().toString() + '-sse',
              role: ChatRole.ASSISTANT,
              content:
                isThinking || isAnswer || isGameGenerator || isGameSignal
                  ? isAnswer
                    ? textContent
                    : ''
                  : textContent,
              sender_id: null,
              parts: isThinking
                ? [{ type: 'thinking', text: textContent }]
                : isAnswer
                ? [{ type: 'answer', text: textContent }]
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
  }, [clearResponseTimeout, coerceToString]);

  // Do not auto-connect on mount; connections are opened per message send.
  useEffect(() => {
    manualCloseRef.current = false;
    return () => {
      manualCloseRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      try {
        esRef.current?.close();
      } catch {}
      esRef.current = null;
      clearResponseTimeout();
    };
  }, [clearResponseTimeout]);

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
        metadata: {},
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
                  setSseConnected(false);
                  setIsAssistantStreaming(false);
                  setIsAwaitingDone(false);
                  // Clear the timeout to ensure streaming state is reset
                  if (assistantStreamEndTimeoutRef.current) {
                    clearTimeout(assistantStreamEndTimeoutRef.current);
                    assistantStreamEndTimeoutRef.current = null;
                  }
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
                setSseConnected(false);
                setIsAssistantStreaming(false);
                setIsAwaitingDone(false);
                // Clear the timeout to ensure streaming state is reset
                if (assistantStreamEndTimeoutRef.current) {
                  clearTimeout(assistantStreamEndTimeoutRef.current);
                  assistantStreamEndTimeoutRef.current = null;
                }
                throw error;
              });
          };

          pump();
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          console.log('[SSE] Fetch error occurred, stopping streaming');
          setSseConnected(false);
          setIsAssistantStreaming(false);
          setIsAwaitingDone(false);
          // Clear the timeout to ensure streaming state is reset
          if (assistantStreamEndTimeoutRef.current) {
            clearTimeout(assistantStreamEndTimeoutRef.current);
            assistantStreamEndTimeoutRef.current = null;
          }
          throw error;
        });
    },
    [chatId, user_id],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
