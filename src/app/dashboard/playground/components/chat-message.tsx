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
import {
  Task,
  TaskContent,
  TaskItemFile,
  TaskTrigger,
} from '@/components/ui/shadcn-io/ai/task';
import React, { FC, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

// Component để render Game Generator content với TaskItemFile
const GameGeneratorContent = ({ content }: { content: string }) => {
  const parseGameGeneratorContent = (text: string) => {
    const lines = text.split('\n');
    const result: React.ReactElement[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect file manifest format: "File Manifest:- file1-file2-file3-..."
      const fileManifestMatch = line.match(/^File Manifest:-\s*(.+)$/);
      if (fileManifestMatch) {
        const files = fileManifestMatch[1]
          .split('-')
          .filter((f) => f.trim() !== '');
        result.push(
          <div key={i} className="mb-4">
            <div className="font-semibold text-sm mb-2">File Manifest:</div>
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <TaskItemFile key={index}>{file.trim()}</TaskItemFile>
              ))}
            </div>
          </div>,
        );
      }
      // Detect file references (lines starting with * `filename`:)
      else if (line.match(/^\*\s*`([^`]+)`:\s*(.+)$/)) {
        const fileMatch = line.match(/^\*\s*`([^`]+)`:\s*(.+)$/);
        if (fileMatch) {
          const [, filename, description] = fileMatch;
          result.push(
            <div key={i} className="flex items-start gap-2 mb-2">
              <TaskItemFile>{filename}</TaskItemFile>
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
            </div>,
          );
        }
      } else {
        // Regular markdown content
        result.push(
          <div key={i} className="mb-2 text-sm">
            <ReactMarkdown>{line}</ReactMarkdown>
          </div>,
        );
      }
    }

    return result;
  };

  return <div className="space-y-1">{parseGameGeneratorContent(content)}</div>;
};

type ChatMessageProps = {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content?: string;
    parts?: Array<{ type: string; text?: string; content?: string }>;
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

  const gameGeneratorItems = useMemo(() => {
    if (!Array.isArray(message.parts)) return [] as string[];
    return message.parts
      .filter((part) => part.type === 'game_generator')
      .map((part) => part.text ?? part.content ?? '')
      .filter((v) => v.trim() !== '');
  }, [message.parts]);

  return (
    <UIMessage from={isUser ? 'user' : 'assistant'}>
      <div className="flex flex-col gap-2 px-2">
        {!isUser && (
          <>
            <MessageAvatar name="AI" src="/icon.png" />
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
        {!isUser && gameGeneratorItems.length > 0 && (
          <Task defaultOpen={true} className="w-full mb-0">
            <TaskTrigger title="Game Generator" />
            <TaskContent>
              <GameGeneratorContent content={gameGeneratorItems.join('')} />
            </TaskContent>
          </Task>
        )}
        <MessageContent>
          <ReactMarkdown>{content}</ReactMarkdown>
        </MessageContent>
      </div>
    </UIMessage>
  );
};
