'use client';
import { ChatInput } from '@/app/dashboard/playground/components/chat-input';
import { ChangeEvent, FC } from 'react';

type PlaygroundInputProps = {
  value: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  submitDisabled?: boolean;
}

export const PlaygroundInput: FC<PlaygroundInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  submitDisabled = false,
}: PlaygroundInputProps) => {
  return (
    <div>
      <ChatInput
        value={value}
        onChange={onChange || (() => {})}
        onSubmit={onSubmit || (() => {})}
        disabled={disabled}
        submitDisabled={submitDisabled}
      />
    </div>
  );
};
