'use client';

import {
  MessageAvatar,
  MessageContent,
  Message as UIMessage,
} from '@/components/ui/shadcn-io/ai/message';
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

export const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
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
      <MessageContent>
        <ReactMarkdown>{content}</ReactMarkdown>
      </MessageContent>
      <MessageAvatar
        name={isUser ? 'You' : 'AI'}
        src={isUser ? '/icon.png' : '/icon.png'}
      />
    </UIMessage>
  );
};
