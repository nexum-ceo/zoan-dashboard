import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Paperclip, Plus, Settings } from 'lucide-react';
import React from 'react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border border-border rounded-xl bg-background shadow-sm px-3 py-2">
        {/* Left Icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat Input */}
        <Input
          placeholder="Enter your message..."
          className="flex-1 min-w-[180px] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={value}
          onChange={onChange}
        />

        {/* Right Buttons */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button variant="ghost" size="icon" type="button">
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            className="text-xs px-3 py-1.5 whitespace-nowrap"
            type="submit"
          >
            Run <span className="ml-1 text-muted-foreground">⌘↵</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
