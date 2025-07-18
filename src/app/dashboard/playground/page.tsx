'use client';
import { Button } from '@/components/ui/button';
import { useChat } from '@ai-sdk/react';
import { Plus } from 'lucide-react';
import ChatInput from './component/ChatInput';
import SelectAssistant from './component/SelectAssistant';

export default function PlaygroundPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: 'user',
        content: 'Hello, how are you?',
      },
    ],
  });
  return (
    <div className="w-full h-full bg-sidebar rounded-lg border border-border flex flex-col">
      <div className="p-4 text-2xl font-semibold border-b border-border bg-white rounded-t-lg w-full">
        Playground
      </div>

      <div className="m-2 rounded-lg flex-1 flex flex-row gap-3">
        <div className="flex bg-white flex-1 rounded-lg flex-col gap-2 p-2">
          <SelectAssistant />
          <Button className="w-full">
            <Plus />
            New Chat
          </Button>
        </div>
        <div className="flex items-center justify-between bg-white flex-6 rounded-lg flex-col gap-2">
          <div className="flex flex-col gap-2 justify-center items-center w-full h-full">
            <div className="text-sm font-medium">Chat</div>
            <div className="text-sm text-muted-foreground">
              Chat with your assistant
            </div>
          </div>
          {messages.map((message: any) => (
            <div key={message.id} className="whitespace-pre-wrap">
              {message.role === 'user' ? 'User: ' : 'AI: '}
              {Array.isArray(message.parts)
                ? message.parts.map((part: any, i: number) => {
                    if (part.type === 'text') {
                      return <div key={`${message.id}-${i}`}>{part.text}</div>;
                    }
                    return null;
                  })
                : message.content}
            </div>
          ))}

          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
