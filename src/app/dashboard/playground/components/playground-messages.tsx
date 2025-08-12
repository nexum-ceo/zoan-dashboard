'use client';
import { ChatMessage } from '@/app/dashboard/playground/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { ArrowDown, MessageSquare } from 'lucide-react';
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
  messagesContainerRef,
  messagesEndRef,
  showScrollButton,
  onScrollToBottom,
}: PlaygroundMessagesProps) {
  return (
    <>
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
            <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
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
          onClick={onScrollToBottom}
          className="absolute bottom-40 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-all"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-6 h-6" />
        </Button>
      )}
    </>
  );
}
