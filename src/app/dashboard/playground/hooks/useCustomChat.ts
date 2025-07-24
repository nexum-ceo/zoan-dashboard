import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
};

export type UseCustomChatProps = {
  wsUrl: string;
  chatId: string;
  agentId: string;
  initialMessages?: ChatMessage[];
  wsConnected?: boolean;
};

export function useCustomChat({
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
    wsRef.current = new WebSocket(wsUrl);
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
        } catch (err) {
          console.log('Error parsing WebSocket message:', err);
        }
        return String(event.data);
      })();
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
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
              role: 'assistant',
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
          type: 'text',
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
      role: 'user',
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
          type: 'text',
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
