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
import CloseIcon from '../../../../../public/icon/close';

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
        className="z-10 relative rounded-xl border focus-within:border-primary-brand-darker-green bg-card text-card-foreground"
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
        <div className="rounded-b-xl -mt-3 flex items-center justify-between bg-primary-brand-green px-4 pb-3 pt-7 text-sm text-paragraph border border-emerald-100 shadow-sm z-0">
          <span className="flex items-center gap-2">
            <span>Upgrade now to get more tokens and unlock access to</span>
            <span className="font-bold">AI V2</span>
            <span>!</span>
          </span>
          <span
            className="cursor-pointer text-[#272727]/50"
            onClick={() => setShowUpgradeBanner(false)}
          >
            <CloseIcon />
          </span>
        </div>
      )}
    </div>
  );
};
