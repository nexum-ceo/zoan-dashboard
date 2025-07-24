'use client';
import { ChatInput } from '@/app/dashboard/playground/component/ChatInput';
import { ChatMessage } from '@/app/dashboard/playground/component/ChatMessage';
import { Button } from '@/components/ui/button';
import { ArrowDown, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SelectAssistant from '../component/SelectAssistant';
import { useCustomChat } from '../hooks/useCustomChat';

export default function PlaygroundChatPage() {
  // State for selected agent
  const [agentId, setAgentId] = useState<string | undefined>(undefined);
  const params = useParams();
  const chatId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : '';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  const searchParams = useSearchParams();
  // Lấy message đầu tiên từ localStorage nếu có
  const [pendingMsg, setPendingMsg] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pendingMessage') || '';
    }
    return '';
  });
  const [firstMsgSent, setFirstMsgSent] = useState<boolean>(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    setMessages,
    wsConnected,
    sendMessageDirect,
  } = useCustomChat({
    wsUrl: `wss://mvp-be.buymed.site/ws/${chatId}`,
    initialMessages: [],
    agentId: agentId || '',
    chatId: chatId,
  });

  // Fetch chat detail if chatId exists
  useEffect(() => {
    if (chatId) {
      fetch(`/api/chat/${chatId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch chat detail');
          return res.json();
        })
        .then((data) => {
          console.log('Fetched chat detail:', data.data);
          if (Array.isArray(data?.data)) {
            // Ensure role is correct type
            const safeMessages = data.data.map((msg: any) => ({
              ...msg,
              role: ['user', 'assistant', 'system', 'data'].includes(msg.role)
                ? msg.role
                : 'user',
            }));
            setMessages(safeMessages);
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // Chỉ gửi message đầu tiên khi ws đã connect, nếu chưa connect thì giữ lại để gửi sau
  useEffect(() => {
    if (pendingMsg && !firstMsgSent && wsConnected) {
      sendMessageDirect(pendingMsg);
      setFirstMsgSent(true);
      setPendingMsg('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingMessage');
      }
    }
  }, [pendingMsg, firstMsgSent, wsConnected, sendMessageDirect]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm h-[750px] 2xl:h-[996px]">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              AI Playground
            </h1>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 p-4">
          <SelectAssistant onAgentChange={setAgentId} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white 2xl:h-[996px] h-[750px] relative">
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 px-6 py-4 space-y-6 w-full overflow-y-auto h-full"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 max-w-md">
                Ask me anything! I'm here to help with your questions and tasks.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                isLoading={
                  isLoading &&
                  index === messages.length - 1 &&
                  message.role === 'assistant'
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <Button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-40 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-all"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-6 h-6" />
          </Button>
        )}

        {/* Input Area */}
        <div className="p-6 bg-white">
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
