'use client';
import { ChatInput } from '@/app/dashboard/playground/components/chat-input';
import { ChangeEvent } from 'react';

interface PlaygroundInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
}

export function PlaygroundInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: PlaygroundInputProps) {
  return (
    <div className="p-6 bg-white">
      <ChatInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={disabled}
      />
    </div>
  );
}
