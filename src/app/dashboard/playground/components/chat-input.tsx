import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Paperclip, Plus, Settings } from 'lucide-react';
import {
  ChangeEvent,
  FC,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
} from 'react';

type ChatInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
};

export const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 24; // Single line height
      const maxHeight = 120; // Max 6 lines
      textarea.style.height =
        Math.min(Math.max(scrollHeight, minHeight), maxHeight) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Create a synthetic form event
      const syntheticEvent = {
        preventDefault: () => {},
        currentTarget: e.currentTarget.form,
      } as FormEvent<HTMLFormElement>;
      onSubmit(syntheticEvent);
    }
  };

  const handleRunClick = () => {
    // Create a synthetic form event for button click
    const syntheticEvent = {
      preventDefault: () => {},
      currentTarget: textareaRef.current?.form,
    } as FormEvent<HTMLFormElement>;
    onSubmit(syntheticEvent);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      <div className="border border-border rounded-2xl bg-card text-card-foreground shadow-sm focus-within:border-ring focus-within:shadow-md transition-all duration-200">
        {/* Textarea area - takes available space */}
        <div className="px-4 pt-4 pb-2">
          <Textarea
            ref={textareaRef}
            placeholder="Enter your message..."
            className="leading-6 min-h-[24px] border-0 focus:border-0 focus:ring-0 focus:outline-none resize-none w-full bg-transparent placeholder:text-muted-foreground"
            style={{ lineHeight: '1.5' }}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>

        {/* Actions bar - always at bottom */}
        <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-border">
          {/* Left Icons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              disabled={disabled}
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              disabled={disabled}
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              disabled={disabled}
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="secondary"
              className="text-sm px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
              onClick={handleRunClick}
              disabled={disabled || !value.trim()}
            >
              Run
              <span className="ml-1 text-xs text-muted-foreground">↵</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
