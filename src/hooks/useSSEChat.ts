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

    // Since we're using POST requests, we don't need EventSource
    // The streaming is handled by the fetch in postMessage
    console.log('[SSE] SSE connection established (fetch-based)');
  }, []);

  // Keep a ref to latest setupSSE to avoid dependency cycles
  useEffect(() => {
    setupSSERef.current = setupSSE;
  }, [setupSSE]);

  // Unified SSE data handler (used by EventSource or BroadcastChannel)
  useEffect(() => {
    handleSSEDataRef.current = (raw: string) => {
      console.log('[SSE] Received data:', raw);
      console.log('[SSE] Data length:', raw.length);
      console.log('[SSE] Data type:', typeof raw);
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
        console.log('[SSE] Processing chunk:', rawData);

        // Handle [DONE] signal
        if (rawData.trim() === '[DONE]') {
          console.log('[SSE] [DONE] received, closing connection');
          try {
            esRef.current?.close();
          } catch {}
          esRef.current = null;
          setSseConnected(false);
          setIsAssistantStreaming(false);
          return null;
        }

        // Handle completion message
        if (rawData.includes('"message": "Response completed"')) {
          console.log('[SSE] Completion message received, closing connection');
          try {
            esRef.current?.close();
          } catch {}
          esRef.current = null;
          setSseConnected(false);
          setIsAssistantStreaming(false);
          return null;
        }

        // Try to parse as JSON first
        try {
          console.log('[SSE] Raw data before parsing:', rawData);
          const data = JSON.parse(rawData);
          console.log('[SSE] Parsed JSON data:', data);
          console.log('[SSE] Data type:', data?.type);
          console.log(
            '[SSE] Is filtered type:',
            data?.type && FILTERED_MESSAGE_TYPES.has(data.type),
          );

          // Filter out unwanted message types
          if (data?.type && FILTERED_MESSAGE_TYPES.has(data.type)) {
            console.log('[SSE] Filtering out message type:', data.type);
            return null;
          }

          // Only return data that has actual content
          const content = coerceToString(data);
          if (!content || content.trim() === '') {
            console.log('[SSE] No content found in data, skipping');
            return null;
          }

          return rawData;
        } catch (parseError) {
          console.log(
            '[SSE] JSON parse failed, treating as raw text:',
            parseError,
          );
          // If it's not JSON, check if it looks like JSON but failed to parse
          if (rawData.trim().startsWith('{') && rawData.trim().endsWith('}')) {
            console.log('[SSE] Looks like JSON but failed to parse, skipping');
            return null;
          }

          // Only return non-empty raw text
          if (!rawData || rawData.trim() === '') {
            console.log('[SSE] Empty raw data, skipping');
            return null;
          }

          return rawData;
        }
      })();
      if (!chunk) {
        console.log('[SSE] Chunk filtered out, skipping');
        return;
      }
      const isDone = chunk.trim() === '[DONE]';

      // Handle completion event to close connection
      if (isDone) {
        console.log('[SSE] Completion received, closing connection');
        try {
          esRef.current?.close();
        } catch {}
        esRef.current = null;
        setSseConnected(false);
        setIsAssistantStreaming(false);
        return;
      }

      try {
        console.log('[SSE] Processing chunk for message update:', chunk);

        // Force a re-render to show streaming state
        setIsAssistantStreaming(true);

        setMessages((prev) => {
          let parsed: unknown = null;
          try {
            parsed = JSON.parse(chunk);
            console.log('[SSE] Successfully parsed JSON:', parsed);
          } catch (parseError) {
            console.log('[SSE] Failed to parse as JSON:', parseError);
          }
          const parsedRecord: Record<string, unknown> | null =
            parsed && typeof parsed === 'object'
              ? (parsed as Record<string, unknown>)
              : null;
          console.log('[SSE] Parsed record:', parsedRecord);

          const isThinking =
            !!parsedRecord && parsedRecord['type'] === 'thinking';
          const isAnswer = !!parsedRecord && parsedRecord['type'] === 'answer';
          const isCompletion =
            !!parsedRecord && parsedRecord['type'] === 'completion';
          const isGameGenerator =
            !!parsedRecord && parsedRecord['type'] === 'game_generator';
          const isGameSignal =
            !!parsedRecord && parsedRecord['type'] === 'game-signal';

          console.log('[SSE] Message type flags:', {
            isThinking,
            isAnswer,
            isCompletion,
            isGameGenerator,
            isGameSignal,
          });
          console.log('[SSE] Parsed record type:', parsedRecord?.['type']);
          console.log(
            '[SSE] Parsed record keys:',
            parsedRecord ? Object.keys(parsedRecord) : 'null',
          );
          let textContent: string;
          if (isThinking) {
            console.log('[SSE] Processing thinking message');
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
            console.log('[SSE] Thinking text content:', textContent);
          } else if (isAnswer) {
            console.log('[SSE] Processing answer message');
            console.log('[SSE] Answer parsedRecord:', parsedRecord);
            // For answer type, directly get content field
            textContent =
              typeof parsedRecord!['content'] === 'string'
                ? parsedRecord!['content']
                : coerceToString(parsedRecord!['content'] ?? parsedRecord);
            console.log('[SSE] Answer text content:', textContent);
            console.log(
              '[SSE] Answer text content length:',
              textContent?.length,
            );
            // For answer type, we should process even empty chunks to maintain message structure
            if (!textContent || textContent.trim() === '') {
              console.log(
                '[SSE] Empty answer chunk, but continuing to maintain message structure',
              );
              textContent = ''; // Set to empty string instead of returning
            }
          } else if (isGameGenerator) {
            console.log('[SSE] Processing game generator message');
            textContent = coerceToString(
              parsedRecord!['content'] ??
                parsedRecord!['text'] ??
                parsedRecord!['data'] ??
                parsedRecord,
            );
            console.log('[SSE] Game generator text content:', textContent);
            // Only process if there's actual content to show
            if (!textContent || textContent.trim() === '') {
              console.log('[SSE] Skipping empty game generator chunk');
              return prev;
            }
          } else if (isGameSignal) {
            console.log('[SSE] Processing game signal message');
            textContent = coerceToString(
              parsedRecord!['content'] ??
                parsedRecord!['text'] ??
                parsedRecord!['data'] ??
                parsedRecord,
            );
            console.log('[SSE] Game signal text content:', textContent);
            // Only process if there's actual content to show
            if (!textContent || textContent.trim() === '') {
              console.log('[SSE] Skipping empty game signal chunk');
              return prev;
            }
          } else {
            console.log('[SSE] Processing generic message');
            const primary =
              parsedRecord && typeof parsedRecord['content'] === 'string'
                ? (parsedRecord['content'] as string)
                : null;
            if (primary !== null) {
              textContent = primary;
              console.log('[SSE] Using primary content:', textContent);
            } else if (parsedRecord) {
              const alt = coerceToString(parsedRecord);
              textContent = alt.trim() !== '' ? alt : String(chunk);
              console.log('[SSE] Using alternative content:', textContent);
            } else {
              textContent = typeof chunk === 'string' ? chunk : String(chunk);
              console.log('[SSE] Using raw chunk:', textContent);
            }
            // Only process if there's actual content to show
            if (!textContent || textContent.trim() === '') {
              console.log('[SSE] Skipping empty generic chunk');
              return prev;
            }
          }
          console.log('[SSE] Final text content:', textContent);
          console.log('[SSE] Previous messages count:', prev.length);
          console.log(
            '[SSE] Last message role:',
            prev.length > 0 ? prev[prev.length - 1].role : 'none',
          );

          if (
            prev.length > 0 &&
            prev[prev.length - 1].role === ChatRole.ASSISTANT
          ) {
            console.log('[SSE] Updating existing assistant message');
            const updated = [...prev];
            const last = { ...updated[updated.length - 1] } as ChatMessage;
            console.log('[SSE] Current last message:', last);
            if (isThinking) {
              console.log('[SSE] Adding thinking part to existing message');
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              existingParts.push({ type: 'thinking', text: textContent });
              last.parts = existingParts;
            } else if (isAnswer) {
              console.log('[SSE] Adding answer part to existing message');
              console.log('[SSE] Before update - last.content:', last.content);
              console.log('[SSE] Adding textContent:', textContent);
              last.content = String(last.content || '') + textContent;
              console.log('[SSE] After update - last.content:', last.content);
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              // For answer type, always add to parts to maintain structure
              // Even if textContent is empty, we need to maintain the answer part
              existingParts.push({ type: 'answer', text: textContent });
              last.parts = existingParts;
              console.log('[SSE] Updated parts:', last.parts);
            } else if (isGameGenerator) {
              console.log(
                '[SSE] Adding game generator part to existing message',
              );
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
              console.log('[SSE] Adding game signal part to existing message');
              const existingParts = Array.isArray(last.parts)
                ? last.parts.slice()
                : [];
              // Only add parts with actual content
              if (textContent && textContent.trim() !== '') {
                existingParts.push({ type: 'game-signal', text: textContent });
                last.parts = existingParts;
              }
            } else {
              console.log('[SSE] Adding text part to existing message');
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
            console.log('[SSE] Final updated message:', last);
            console.log('[SSE] Final updated message content:', last.content);
            return updated;
          } else {
            // For answer type, create message even if first chunk is empty
            // For other types, only create if there's actual content
            if (!isAnswer && (!textContent || textContent.trim() === '')) {
              console.log('[SSE] Skipping empty content for new message');
              return prev;
            }
            console.log('[SSE] Creating new assistant message');
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
            console.log('[SSE] New message created:', newMsg);
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
    (text: string) => {
      const requestBody = {
        sender_id: user_id,
        role: ChatRole.USER,
        content: text,
        metadata: {},
      };

      console.log('Sending POST request to completion endpoint:', {
        url: `/api/chat/${encodeURIComponent(chatId)}/completion`,
        method: 'POST',
        body: requestBody,
      });

      // Use fetch for SSE streaming
      fetch(`/api/chat/${encodeURIComponent(chatId)}/completion`, {
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
          console.log(
            'Response received:',
            response.status,
            response.statusText,
            'Headers:',
            Object.fromEntries(response.headers.entries()),
          );
          if (!response.ok) {
            console.error(
              'Response not ok:',
              response.status,
              response.statusText,
            );
            return;
          }

          // Handle streaming response
          if (!response.body) {
            console.error('No response body for streaming');
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const pump = () => {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  console.log('[SSE] Stream completed');
                  setSseConnected(false);
                  setIsAssistantStreaming(false);
                  // Clear the timeout to ensure streaming state is reset
                  if (assistantStreamEndTimeoutRef.current) {
                    clearTimeout(assistantStreamEndTimeoutRef.current);
                    assistantStreamEndTimeoutRef.current = null;
                  }
                  return;
                }

                // Decode chunk and process
                const chunk = decoder.decode(value, { stream: true });
                console.log('[SSE] Received chunk:', chunk);
                buffer += chunk;

                // Process complete lines
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmedLine = line.trim();
                  if (trimmedLine) {
                    console.log('[SSE] Processing line:', trimmedLine);

                    // Skip event types and only process data lines
                    if (
                      trimmedLine.startsWith('event:') ||
                      trimmedLine.startsWith('id:') ||
                      trimmedLine.startsWith('retry:')
                    ) {
                      console.log('[SSE] Skipping event line:', trimmedLine);
                      continue;
                    }

                    // Only process data lines
                    if (trimmedLine.startsWith('data: ')) {
                      const data = trimmedLine.substring(6);
                      if (data && data.trim() !== '') {
                        console.log('[SSE] Processing data:', data);
                        handleSSEDataRef.current(data);
                      }
                    }
                  }
                }

                pump();
              })
              .catch((error) => {
                console.error('[SSE] Stream read error:', error);
                setSseConnected(false);
                setIsAssistantStreaming(false);
                // Clear the timeout to ensure streaming state is reset
                if (assistantStreamEndTimeoutRef.current) {
                  clearTimeout(assistantStreamEndTimeoutRef.current);
                  assistantStreamEndTimeoutRef.current = null;
                }
              });
          };

          pump();
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          setSseConnected(false);
          setIsAssistantStreaming(false);
        });

      lastMessageAtRef.current = Date.now();
    },
    [chatId, user_id],
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
