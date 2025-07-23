'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Bot, Copy, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import { FC, useState } from 'react';

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
  const [showActions, setShowActions] = useState<boolean>(false);
  const isUser = message.role === 'user';

  const content = Array.isArray(message.parts)
    ? message.parts
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('')
    : message.content;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content ?? '');
  };

  return (
    <div
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-600'
            : 'bg-gradient-to-r from-green-400 to-blue-500'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 whitespace-pre-wrap max-w-3xl ${
          isUser ? 'flex justify-end' : ''
        }`}
      >
        <div
          className={`relative ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-md'
              : 'bg-gray-50 text-gray-900 rounded-2xl rounded-tl-md border border-gray-200'
          } px-4 py-3 shadow-sm`}
        >
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
        </div>

        {/* Message Actions */}
        {!isUser && !isLoading && (
          <div
            className={`flex items-center gap-1 mt-2 transition-opacity duration-200 ${
              showActions ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-7 px-2 text-gray-500 hover:text-gray-700"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-gray-500 hover:text-gray-700"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Like</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-gray-500 hover:text-gray-700"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Dislike</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
