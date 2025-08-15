'use client';
import { ChatSettings } from '@/app/dashboard/playground/components/chat-setting';
import { Explore } from '@/app/dashboard/playground/components/explore';
import { useAgent } from '@/contexts/AgentContext';
import { useChat } from '@/hooks/useChat';
import { handleErrorApi } from '@/lib/utils';
import { useGetAgentList } from '@/queries/useAgent';
import { useCreateChatMutation } from '@/queries/useChat';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { PlaygroundHeader } from './playground-header';
import { PlaygroundInput } from './playground-input';
import { PlaygroundMessages } from './playground-messages';

export function PlaygroundClient() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<'settings' | 'explore' | null>(
    'settings',
  );
  const { selectedAgentId } = useAgent();

  const { data: agentData } = useGetAgentList();
  const agents = agentData?.data.data || [];
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

  const { messages, handleSubmit, isLoading } = useChat({
    initialMessages: [],
    // agentId: selectedAgentId || '',
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
    if (!pendingMessage.trim()) return;

    createChatMutation.mutate(
      {
        title: pendingMessage,
      },
      {
        onSuccess: (data) => {
          const chatId = data.data.data.id;
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

  const handleTogglePanel = (panel: 'settings' | 'explore' | null) => {
    setActivePanel(panel);
  };

  return (
    <>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-sidebar relative">
        {/* Header */}
        <PlaygroundHeader
          selectedAgent={selectedAgent}
          activePanel={activePanel}
          onTogglePanel={handleTogglePanel}
        />

        {/* Messages */}
        <PlaygroundMessages
          messages={messages}
          isLoading={isLoading}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef}
          showScrollButton={showScrollButton}
          onScrollToBottom={scrollToBottom}
        />

        {/* Input Area */}
        <PlaygroundInput
          value={pendingMessage}
          onChange={(e) => setPendingMessage(e.target.value)}
          onSubmit={messages.length === 0 ? handleFirstSubmit : handleSubmit}
          disabled={false}
        />
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
    </>
  );
}
