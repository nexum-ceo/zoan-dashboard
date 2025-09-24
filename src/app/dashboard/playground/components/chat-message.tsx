'use client';

import { Action, Actions } from '@/components/ui/shadcn-io/ai/actions';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckIcon,
  CopyIcon,
  Pen,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'lucide-react';
import React, { FC, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

// Component to render Game Generator content with TaskItemFile
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
            <div className="font-medium text-paragraph mb-2">
              File Manifest:
            </div>
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
              <span className="text-xs text-paragraph">{description}</span>
            </div>,
          );
        }
      } else {
        // Regular markdown content
        result.push(
          <div
            key={i}
            className="mb-2 text-xs text-paragraph !text-[#272727]/50"
          >
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
    metadata?: Record<string, string>;
    isComplete?: boolean;
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

  // State for actions
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Action handlers
  const handleRetry = () => {
    console.log('Retry message:', message.id);
    // TODO: Implement retry logic
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Message copied to clipboard');
      setCopied(true);
      // Reset to copy icon after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // User action handlers
  const handleEditUserMessage = () => {
    console.log('Edit user message:', message.id);
    // TODO: Implement edit logic
  };

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      return;
    }
    setLiked(true);
    setDisliked(false); // Ensure dislike is cleared when liking
  };

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
      return;
    }
    setDisliked(true);
    setLiked(false); // Ensure like is cleared when disliking
  };

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
        .map((part) => {
          // Include both 'text' and 'answer' types for content display
          if (part.type === 'text' || part.type === 'answer') {
            return part.text || '';
          }
          return '';
        })
        .join('');
    }
    return message.content || '';
  }, [message.parts, message.content]);

  const gameGeneratorItems = useMemo(() => {
    const items: string[] = [];

    // Check parts for game_generator
    if (Array.isArray(message.parts)) {
      const partItems = message.parts
        .filter((part) => part.type === 'game_generator')
        .map((part) => part.text ?? part.content ?? '')
        .filter((v) => v.trim() !== '');
      items.push(...partItems);
    }

    // Check metadata for game_generator
    if (message.metadata?.game_generator) {
      const metadataContent =
        typeof message.metadata.game_generator === 'string'
          ? message.metadata.game_generator
          : JSON.stringify(message.metadata.game_generator);
      if (metadataContent.trim() !== '') {
        items.push(metadataContent);
      }
    }

    return items;
  }, [message.parts, message.metadata]);

  const isAssistantStreamingCurrent = isLoading && isLast;
  const showAssistantActions = !isUser && !isAssistantStreamingCurrent;

  return (
    <UIMessage from={isUser ? 'user' : 'assistant'}>
      <div className="flex flex-col gap-2 px-2">
        {!isUser && (
          <>
            <MessageAvatar name="AI" src="/icon.png" />
            <div className="text-sm font-medium">AI Agent priority</div>
          </>
        )}
        {!isUser && thinkingText && (
          <Reasoning
            className="w-full mb-0"
            isStreaming={Boolean(isLoading && isLast)}
            defaultOpen={true}
          >
            <ReasoningTrigger className="!text-xs" />
            <ReasoningContent className="!text-xs">
              {thinkingText}
            </ReasoningContent>
          </Reasoning>
        )}
        {!isUser && gameGeneratorItems.length > 0 && (
          <Task
            defaultOpen={Boolean(isLoading && isLast)}
            className="w-full mb-0"
          >
            <TaskTrigger className="!text-xs" title="Game Generator" />
            <TaskContent>
              <GameGeneratorContent content={gameGeneratorItems.join('')} />
            </TaskContent>
          </Task>
        )}
        <MessageContent className="text-xs text-[#272727] shadow-none px-3 py-2 font-medium leading-3.5">
          <ReactMarkdown>{content}</ReactMarkdown>
        </MessageContent>

        {/* Actions for user messages */}
        {isUser && (
          <TooltipProvider>
            <Actions className="justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Action
                    label="Edit"
                    className="p-0"
                    onClick={handleEditUserMessage}
                  >
                    <Pen className="size-4" />
                  </Action>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit message</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Action label="Copy" onClick={handleCopy}>
                    {copied ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Action>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy'}</p>
                </TooltipContent>
              </Tooltip>
            </Actions>
          </TooltipProvider>
        )}

        {/* Actions for assistant messages - hide only while the last message is streaming */}
        {showAssistantActions && (
          <TooltipProvider>
            <Actions className="">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Action label="Copy" onClick={handleCopy}>
                    {copied ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Action>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy'}</p>
                </TooltipContent>
              </Tooltip>

              {!disliked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Action
                      label="Like"
                      onClick={handleLike}
                      className={liked ? 'text-[#272727]/20' : ''}
                    >
                      <ThumbsUpIcon
                        className={`size-4 ${liked ? 'fill-[#272727]/20' : ''}`}
                      />
                    </Action>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{liked ? 'Remove like' : 'Like'}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {!liked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Action
                      label="Dislike"
                      onClick={handleDislike}
                      className={disliked ? 'text-[#272727]/20' : ''}
                    >
                      <ThumbsDownIcon
                        className={`size-4 ${
                          disliked ? 'fill-[#272727]/20' : ''
                        }`}
                      />
                    </Action>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{disliked ? 'Remove dislike' : 'Dislike'}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Action
                    label="Retry"
                    onClick={handleRetry}
                    className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    disabled={isLoading}
                  >
                    <RefreshCcwIcon className="size-4" />
                  </Action>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLoading ? 'Please wait...' : 'Regenerate response'}</p>
                </TooltipContent>
              </Tooltip>
            </Actions>
          </TooltipProvider>
        )}
      </div>
    </UIMessage>
  );
};
