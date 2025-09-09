//
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input';
import type { ChatStatus } from 'ai';
import { Paperclip } from 'lucide-react';
import { ChangeEvent, FC, FormEvent, useState } from 'react';

type ChatInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  status?: ChatStatus;
};

export const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  status,
}) => {
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      <PromptInput
        className="rounded-2xl border active:border-primary-brand-darker-green bg-card text-card-foreground shadow-sm"
        onSubmit={onSubmit}
      >
        <PromptInputTextarea
          placeholder="Ask ZOAN to build something amazing"
          className="leading-6 min-h-[72px] border-0 focus:border-0 focus:ring-0 focus:outline-none resize-none w-full bg-transparent placeholder:text-muted-foreground"
          style={{ lineHeight: '1.5' }}
          name="message"
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <PromptInputToolbar className="px-3 py-2">
          <PromptInputTools>
            <PromptInputButton
              type="button"
              disabled={disabled}
              className="rounded-full bg-accent/40 hover:bg-accent/60"
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </PromptInputButton>
          </PromptInputTools>
          <div className="flex items-center gap-2">
            <PromptInputSubmit
              status={status}
              disabled={disabled || !value.trim()}
            >
              <span className="px-1">»»</span>
            </PromptInputSubmit>
          </div>
        </PromptInputToolbar>
      </PromptInput>
      {showUpgradeBanner && (
        <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <span>
            Upgrade now to get more tokens and unlock access to{' '}
            <span className="font-semibold">AI V2</span>!
          </span>
          <button
            type="button"
            className="rounded p-1 text-emerald-700/70 hover:bg-emerald-100"
            onClick={() => setShowUpgradeBanner(false)}
            aria-label="Dismiss upgrade banner"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
