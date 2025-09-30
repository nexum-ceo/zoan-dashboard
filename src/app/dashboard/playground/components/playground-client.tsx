'use client';

import TopCreators from '@/app/(public)/components/top-creators';
import CommunitySection from '@/app/dashboard/playground/components/community';
import PersonalSpace from '@/app/dashboard/playground/components/personal-space';
import OptionButtons from '@/components/ui/option-buttons';
import { DragDropProvider } from '@/contexts/DragDropContext';
import { useChat } from '@/hooks/useChat';
import { handleErrorApi } from '@/lib/utils';
import { useCreateChatMutation } from '@/queries/useChat';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { PlaygroundInput } from './playground-input';
import { PlaygroundMessages } from './playground-messages';

export function PlaygroundClient() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { messages, handleSubmit, isLoading, isProcessing } = useChat({
    initialMessages: [],
    chatId: '',
    user_id: '',
  });

  // State for pending first message
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const createChatMutation = useCreateChatMutation();
  const router = useRouter();

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
    <DragDropProvider>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center py-20 bg-white">
        <div className="px-25 py-20 pb-6 max-w-7xl w-full">
          {/* Messages */}
          <PlaygroundMessages
            messages={messages}
            isLoading={isLoading}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
            showScrollButton={false}
            onScrollToBottom={scrollToBottom}
          />

          {/* Input Area */}
          <PlaygroundInput
            value={pendingMessage}
            onChange={(e) => setPendingMessage(e.target.value)}
            onSubmit={messages.length === 0 ? handleFirstSubmit : handleSubmit}
            disabled={false}
            submitDisabled={isProcessing}
          />

          {/* AI Suggestion */}
          <div className="mt-6">
            <OptionButtons />
          </div>
        </div>

        <div className="py-20 pt-6 w-full max-w-7xl">
          {/** --- Personal Space Section ---  */}
          <PersonalSpace />

          {/** --- Community Section ---  */}
          <CommunitySection />

          {/** --- Top Creators Section ---  */}
          <TopCreators />
        </div>
      </div>
    </DragDropProvider>
  );
}
