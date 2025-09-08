'use client';
import { ChatMessage } from '@/app/dashboard/playground/components/chat-message';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation';
import { MessageSquare } from 'lucide-react';
import { RefObject } from 'react';

// Import the ChatMessage type from useChat hook
type ChatMessageType = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
};

interface PlaygroundMessagesProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  showScrollButton: boolean;
  onScrollToBottom: () => void;
}

export function PlaygroundMessages({
  messages,
  isLoading,
  messagesEndRef,
  showScrollButton,
}: PlaygroundMessagesProps) {
  return (
    <>
      {/* Messages */}
      <Conversation className="flex-1 w-full">
        <ConversationContent className="px-6 py-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-black dark:text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                What should we build today?
              </h3>
              <p className="text-muted-foreground max-w-md">
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
        </ConversationContent>
        {showScrollButton && <ConversationScrollButton />}
      </Conversation>
    </>
  );
}
