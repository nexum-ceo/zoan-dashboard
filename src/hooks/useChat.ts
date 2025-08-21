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
  // TODO: add user_id to the message, if null the message if from the assistant
  sender_id: string | null;
};

export type UseCustomChatProps = {
  wsUrl?: string;
  chatId: string;
  agentId?: string;
  initialMessages?: ChatMessage[];
  wsConnected?: boolean;
  user_id: string;
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
  // agentId,
  user_id,
  initialMessages = [],
}: UseCustomChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const lastActiveTimeRef = useRef<number>(Date.now());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnectingRef = useRef<boolean>(false);

  // Function to check and reconnect if needed
  const checkAndReconnect = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActive = now - lastActiveTimeRef.current;
    const INACTIVE_THRESHOLD = 30000; // 30 seconds

    console.log(`[WS] Time since last active: ${timeSinceLastActive}ms`);

    // Only reconnect if:
    // 1. User was inactive for more than threshold
    // 2. WebSocket is not connected
    // 3. Not already reconnecting
    if (
      timeSinceLastActive > INACTIVE_THRESHOLD &&
      !wsConnected &&
      !isReconnectingRef.current &&
      wsUrl
    ) {
      console.log('[WS] User was inactive, attempting reconnect...');

      // Inline reconnect logic to avoid dependency issues
      if (!wsUrl || wsUrl.trim() === '' || isReconnectingRef.current) return;

      isReconnectingRef.current = true;
      console.log('[WS] Creating connection to:', wsUrl);

      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      try {
        wsRef.current = new WebSocket(wsUrl);
      } catch (error) {
        console.error(
          '[WS] Failed to create WebSocket during reconnect:',
          error,
        );
        isReconnectingRef.current = false;
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
        isReconnectingRef.current = false;
        console.log('[WS] Connected successfully');
      };

      wsRef.current.onclose = (event) => {
        setWsConnected(false);
        isReconnectingRef.current = false;
        console.log('[WS] Connection closed:', event.code, event.reason);

        if (event.code !== 1000) {
          console.log(
            '[WS] Connection lost, will reconnect when user becomes active',
          );
        }
      };

      wsRef.current.onerror = (err) => {
        setWsConnected(false);
        isReconnectingRef.current = false;
        console.error('[WS] Connection error:', err);
      };

      wsRef.current.onmessage = (event) => {
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

              if (data && data.role && data.content !== undefined) {
                return String(data.content);
              }

              // If JSON but doesn't match expected structure, return raw
              return rawData;
            } catch (err) {
              // JSON-like but invalid, return raw data
              console.warn('[WS] Invalid JSON structure, err:', err);
              return rawData;
            }
          }

          // For streaming text chunks (most common case)
          return rawData;
        })();

        if (!chunk) return;

        try {
          setMessages((prev) => {
            if (
              prev.length > 0 &&
              prev[prev.length - 1].role === ChatRole.ASSISTANT
            ) {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: String(updated[updated.length - 1].content) + chunk,
                // TODO:
                sender_id: null,
              };
              return updated;
            } else {
              return [
                ...prev,
                {
                  id: Date.now().toString() + '-ws',
                  role: ChatRole.ASSISTANT,
                  content: chunk,
                  // TODO:
                  sender_id: null,
                },
              ];
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
    } else if (wsConnected) {
      console.log('[WS] Already connected, no need to reconnect');
    } else if (timeSinceLastActive <= INACTIVE_THRESHOLD) {
      console.log('[WS] User was not inactive long enough, skipping reconnect');
    }

    // Update last active time
    lastActiveTimeRef.current = now;
  }, [wsConnected, wsUrl]);

  // Initial connection - only create once when component mounts
  useEffect(() => {
    if (!wsUrl || wsUrl.trim() === '') {
      console.log('[WS] No valid wsUrl provided, skipping connection');
      return;
    }

    console.log('[WS] Initial connection to:', wsUrl);

    try {
      wsRef.current = new WebSocket(wsUrl);
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
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
      console.log('[WS] Initial connection successful');
    };

    wsRef.current.onclose = (event) => {
      setWsConnected(false);
      console.log('[WS] Initial connection closed:', event.code, event.reason);
    };

    wsRef.current.onerror = (err) => {
      setWsConnected(false);
      console.error('[WS] Initial connection error:', err);
    };

    wsRef.current.onmessage = (event) => {
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

            if (data && data.role && data.content !== undefined) {
              return String(data.content);
            }

            // If JSON but doesn't match expected structure, return raw
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
          if (
            prev.length > 0 &&
            prev[prev.length - 1].role === ChatRole.ASSISTANT
          ) {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: String(updated[updated.length - 1].content) + chunk,
            };
            return updated;
          } else {
            return [
              ...prev,
              {
                id: Date.now().toString() + '-ws',
                role: ChatRole.ASSISTANT,
                content: chunk,
                sender_id: null,
              },
            ];
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

    return () => {
      // Only close connection when component unmounts (page change/component destroy)
      console.log('[WS] Component unmounting, closing connection');

      // Clear any pending timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
        wsRef.current = null;
      }
    };
  }, [wsUrl]);

  // Handle page visibility change for smart reconnect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden - just update last active time, don't close connection
        lastActiveTimeRef.current = Date.now();
      } else {
        // Tab became visible - check if we need to reconnect after being inactive
        // Small delay to ensure tab is fully active
        setTimeout(() => {
          checkAndReconnect();
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

    return () => {
      // Cleanup event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
    };
  }, [checkAndReconnect]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

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
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          role: 'user',
          chat_id: chatId,
          content: input,
          sender_id: user_id,
          metadata: {},
        }),
      );
    }
    setInput('');
    setIsLoading(false);
  };

  // Send message directly via WebSocket
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
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          role: 'user',
          chat_id: chatId,
          content: msg,
          sender_id: user_id,
          metadata: {},
        }),
      );
    }
    setIsLoading(false);
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
    wsConnected,
    sendMessageDirect,
  };
}
