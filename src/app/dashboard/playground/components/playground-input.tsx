'use client';
import { ChatInput } from '@/app/dashboard/playground/components/chat-input';
import { ChangeEvent } from 'react';

interface PlaygroundInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  submitDisabled?: boolean;
}

export function PlaygroundInput({
  value,
  onChange,
  onSubmit,
  disabled,
  submitDisabled = false,
}: PlaygroundInputProps) {
  return (
    <div className="bg-sidebar">
      <ChatInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={disabled}
        submitDisabled={submitDisabled}
      />
    </div>
  );
}
