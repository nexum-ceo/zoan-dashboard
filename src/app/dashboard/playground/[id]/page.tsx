'use client';
import { ChatInput } from '@/app/dashboard/playground/component/ChatInput';
import { ChatMessage } from '@/app/dashboard/playground/component/ChatMessage';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';
import {
  ChatMessageType,
  ChatRole,
  GetChatMessagesResType,
} from '@/types/chat';
import { ArrowDown, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SelectAssistant from '../component/SelectAssistant';

export default function PlaygroundChatPage() {
  // State for selected agent
  const [agentId, setAgentId] = useState<string | undefined>(undefined);
  const router = useRouter();
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

  // Get the first message from localStorage if it exists
  const [pendingMsg, setPendingMsg] = useState<string>(() => {
    return localStorage.getItem('pendingMessage') || '';
  });
  const [firstMsgSent, setFirstMsgSent] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        setToken(data.accessToken);
        console.log('[WS] Session:', data);
      });
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    wsConnected,
    sendMessageDirect,
  } = useChat({
    wsUrl: `${process.env.NEXT_PUBLIC_WS_URL}/${chatId}?token=${token}`,
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
          return res.json() as Promise<GetChatMessagesResType>;
        })
        .then((data) => {
          if (Array.isArray(data?.data)) {
            const safeMessages = data.data.map((msg: ChatMessageType) => ({
              ...msg,
              content: msg.content ?? '',
              role: Object.values(ChatRole).includes(msg.role)
                ? msg.role
                : ChatRole.USER,
            }));
            setMessages(safeMessages);
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // Only send the first message when WebSocket is connected, otherwise keep it to send later
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
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm ">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              AI Playground
            </h1>
          </div>
          <Button
            onClick={() => router.push('/dashboard/playground')}
            className="w-full  border-0 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 p-4">
          <SelectAssistant onAgentChange={setAgentId} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 px-6 py-4 space-y-6 w-full overflow-y-auto h-full"
        >
          {!agentId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Please select an agent to start chatting
              </h3>
              <p className="text-gray-500 max-w-md">
                You must select an agent before you can chat.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16  rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-black" />
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
                  message.role === ChatRole.ASSISTANT
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
            disabled={!agentId}
          />
        </div>
      </div>
    </div>
  );
}
