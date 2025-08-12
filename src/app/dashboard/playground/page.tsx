'use client';
import { ChatInput } from '@/app/dashboard/playground/component/ChatInput';
import { ChatMessage } from '@/app/dashboard/playground/component/ChatMessage';
import { ChatSettings } from '@/app/dashboard/playground/component/chat-setting';
import { Explore } from '@/app/dashboard/playground/component/explore';
import { Button } from '@/components/ui/button';
import { useAgent } from '@/contexts/AgentContext';
import { useChat } from '@/hooks/useChat';
import { handleErrorApi } from '@/lib/utils';
import { useGetAgentList } from '@/queries/useAgent';
import { useCreateChatMutation } from '@/queries/useChat';
import { motion } from 'framer-motion';
import { ArrowDown, Gamepad2, MessageSquare, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

export default function PlaygroundPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<'settings' | 'explore' | null>(
    'settings',
  );
  const { selectedAgentId } = useAgent();

  // Get agent list to display selected agent info
  const { data: agentData } = useGetAgentList();
  const agents = agentData?.data.data || [];
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

  const { messages, handleSubmit, isLoading } = useChat({
    initialMessages: [],
    agentId: selectedAgentId || '',
    chatId: '',
  });

  // State for pending first message
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const createChatMutation = useCreateChatMutation();
  const router = useRouter();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    }
  }, [messages.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length, handleScroll]);

  const handleFirstSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAgentId) {
      handleErrorApi({
        error: new Error('Please select an agent before starting a chat.'),
      });
      return;
    }
    if (!pendingMessage.trim()) return;

    createChatMutation.mutate(
      {
        agent_id: selectedAgentId,
        title: pendingMessage,
      },
      {
        onSuccess: (data) => {
          const chatId = data.data.chat.id;
          localStorage.setItem('pendingMessage', pendingMessage);
          router.push(`/dashboard/playground/${chatId}`);
        },
        onError: (error) => {
          handleErrorApi({ error });
        },
      },
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Header */}
        <div className="w-full px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-900">
                  {selectedAgent?.name || 'No Agent Selected'}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedAgent?.description || 'Please select an agent'}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setActivePanel(activePanel === 'explore' ? null : 'explore')
                  }
                  className={`transition-all duration-300 ${
                    activePanel === 'explore'
                      ? 'bg-blue-100 text-blue-600 shadow-lg ring-2 ring-blue-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setActivePanel(
                      activePanel === 'settings' ? null : 'settings',
                    )
                  }
                  className={`transition-all duration-300 ${
                    activePanel === 'settings'
                      ? 'bg-blue-100 text-blue-600 shadow-lg ring-2 ring-blue-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 px-6 py-4 space-y-6 w-full overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 max-w-md">
                Ask me anything! I&#39;m here to help with your questions and
                tasks.
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
            value={pendingMessage}
            onChange={(e) => setPendingMessage(e.target.value)}
            onSubmit={messages.length === 0 ? handleFirstSubmit : handleSubmit}
            disabled={createChatMutation.isPending || !selectedAgentId}
          />
        </div>
      </div>

      {/* Chat Settings Panel */}
      <ChatSettings
        isOpen={activePanel === 'settings'}
        onClose={() => setActivePanel(null)}
      />

      {/* Explore Panel */}
      <Explore
        isOpen={activePanel === 'explore'}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
}
