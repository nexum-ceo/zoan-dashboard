'use client';
import { ChatRole } from '@/types/chat';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
};

export type UseCustomChatProps = {
  wsUrl?: string;
  chatId: string;
  agentId: string;
  initialMessages?: ChatMessage[];
  wsConnected?: boolean;
};

export function useChat({
  wsUrl,
  chatId,
  agentId,
  initialMessages = [],
}: UseCustomChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  useEffect(() => {
    wsRef.current = new WebSocket(wsUrl || '');
    wsRef.current.onopen = () => {
      setWsConnected(true);
      console.log('[WS] Connected:', wsUrl);
    };
    wsRef.current.onclose = (event) => {
      setWsConnected(false);
      console.log('[WS] Closed:', event);
    };
    wsRef.current.onerror = (err) => {
      setWsConnected(false);
      console.error('[WS] Error:', err);
    };
    wsRef.current.onmessage = (event) => {
      const chunk = (() => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.role && data.content !== undefined) {
            return String(data.content);
          }
        } catch (error) {
          // JSON parse failed - log in development only
          if (process.env.NODE_ENV === 'development') {
            console.warn('[WS] Failed to parse JSON, using raw data:', error);
          }
        }
        return String(event.data);
      })();

      // Skip processing if chunk is empty
      if (!chunk) return;

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
            },
          ];
        }
      });
    };
    return () => {
      wsRef.current?.close();
    };
  }, [wsUrl]);

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
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          role: 'user',
          chat_id: chatId,
          agent_id: agentId,
          content: input,
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
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          role: 'user',
          chat_id: chatId,
          agent_id: agentId,
          content: msg,
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
