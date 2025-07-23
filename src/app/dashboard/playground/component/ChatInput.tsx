import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Paperclip, Plus, Settings } from 'lucide-react';
import { ChangeEvent, FC, FormEvent } from 'react';

type ChatInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-2 border border-border rounded-xl bg-background shadow-sm px-3 py-2">
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
        <Textarea
          placeholder="Ask me anything..."
          className="flex-1 min-w-[180px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none max-h-[105px] overflow-y-auto rounded-md bg-background px-3 py-2 text-sm"
          style={{ lineHeight: '1.5' }}
          value={value}
          onChange={(e) => onChange(e)}
          rows={3}
          // minLength={1}
          // maxLength={500}
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
};
