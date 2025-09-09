'use client';

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
  const { selectedAgentId } = useAgent();

  const { data: agentData } = useGetAgentList();
  const agents = agentData?.data.data || [];
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

  const { messages, handleSubmit, isLoading } = useChat({
    initialMessages: [],
    chatId: '',
    user_id: '',
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

  return (
    <>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-sidebar relative">
        {/* Header */}
        <PlaygroundHeader selectedAgent={selectedAgent} />

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
    </>
  );
}
