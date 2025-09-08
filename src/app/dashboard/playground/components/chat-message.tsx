'use client';

import {
  MessageAvatar,
  MessageContent,
  Message as UIMessage,
} from '@/components/ui/shadcn-io/ai/message';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ui/shadcn-io/ai/reasoning';
import { FC, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

type ChatMessageProps = {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content?: string;
    parts?: Array<{ type: string; text?: string }>;
  };
  isLast: boolean;
  isLoading: boolean;
};

export const ChatMessage: FC<ChatMessageProps> = ({
  message,
  isLast,
  isLoading,
}) => {
  const isUser = message.role === 'user';
  const thinkingText = useMemo(() => {
    if (!Array.isArray(message.parts)) return '';
    return message.parts
      .filter(
        (part) => part.type === 'thinking' && (part.text || '').trim() !== '',
      )
      .map((part) => part.text)
      .join('\n');
  }, [message.parts]);
  const content = useMemo(() => {
    if (Array.isArray(message.parts)) {
      return message.parts
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('');
    }
    return message.content || '';
  }, [message.parts, message.content]);

  return (
    <UIMessage from={isUser ? 'user' : 'assistant'}>
      <div className="flex flex-col gap-2 px-2">
        {!isUser && (
          <>
            <MessageAvatar name="AI" src="/public/icon.png" />
            <div className="text-md font-medium">AI Agent priority</div>
          </>
        )}
        {!isUser && thinkingText && (
          <Reasoning
            className="w-full mb-0"
            isStreaming={Boolean(isLoading && isLast)}
            defaultOpen={true}
          >
            <ReasoningTrigger />
            <ReasoningContent>{thinkingText}</ReasoningContent>
          </Reasoning>
        )}
        <MessageContent>
          <ReactMarkdown>{content}</ReactMarkdown>
        </MessageContent>
      </div>
    </UIMessage>
  );
};
