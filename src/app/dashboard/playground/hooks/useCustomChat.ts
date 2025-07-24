import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
// Dùng WebSocket thuần, không dùng socket.io-client

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

  useEffect(() => {
    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.onopen = () => {
      console.log('[WS] Connected:', wsUrl);
    };
    wsRef.current.onclose = (event) => {
      console.log('[WS] Closed:', event);
    };
    wsRef.current.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
    wsRef.current.onmessage = (event) => {
      console.log('[WS] Message received:', event.data);
      // Nếu là JSON hợp lệ thì xử lý như cũ
      try {
        const data = JSON.parse(event.data);
        if (data && data.role && data.content) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + '-ws',
              role: data.role,
              content: data.content,
            },
          ]);
          return;
        }
      } catch (err) {
        // Nếu không phải JSON, coi là stream text
        setMessages((prev) => {
          // Tìm message assistant cuối cùng
          const lastIdx = [...prev]
            .reverse()
            .findIndex((m) => m.role === 'assistant');
          if (lastIdx === -1) {
            // Chưa có assistant message, tạo mới
            return [
              ...prev,
              {
                id: Date.now().toString() + '-ws',
                role: 'assistant',
                content: event.data,
              },
            ];
          } else {
            // Nối vào message assistant cuối cùng
            const idx = prev.length - 1 - lastIdx;
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              content: updated[idx].content + event.data,
            };
            return updated;
          }
        });
      }
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

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
  };
}
