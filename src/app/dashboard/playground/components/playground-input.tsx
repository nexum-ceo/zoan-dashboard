'use client';
import { ChatInput } from '@/app/dashboard/playground/components/chat-input';
import { ChangeEvent, FC } from 'react';

type PlaygroundInputProps = {
  value: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
};

export const PlaygroundInput: FC<PlaygroundInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
}: PlaygroundInputProps) => {
  return (
    <div>
      <ChatInput
        value={value}
        onChange={onChange || (() => {})}
        onSubmit={onSubmit || (() => {})}
        disabled={disabled}
      />
    </div>
  );
};
