'use client';
import { ChatMessage } from '@/app/dashboard/playground/components/chat-message';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ui/shadcn-io/ai/reasoning';
import { MessageSquare } from 'lucide-react';
import { RefObject } from 'react';

// Import the ChatMessage type from useChat hook
type ChatMessageType = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  parts?: Array<{ type: string; text?: string }>;
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
            messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              const isAssistant = message.role === 'assistant';
              const thinkingParts = (message.parts || []).filter(
                (p) => p.type === 'thinking' && (p.text || '').trim() !== '',
              );
              const thinkingText = thinkingParts.map((p) => p.text).join('\n');
              return (
                <div key={message.id} className="space-y-2">
                  {isAssistant && thinkingParts.length > 0 && (
                    <Reasoning
                      isStreaming={isLoading && isLast}
                      defaultOpen={false}
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>{thinkingText}</ReasoningContent>
                    </Reasoning>
                  )}
                  <ChatMessage
                    message={message}
                    isLast={isLast}
                    isLoading={isLoading && isLast && isAssistant}
                  />
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </ConversationContent>
        {showScrollButton && <ConversationScrollButton />}
      </Conversation>
    </>
  );
}
