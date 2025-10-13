'use client';

import { DragDropProvider } from '@/contexts/DragDropContext';
import { handleErrorApi } from '@/lib/utils';
import { useCreateChatMutation } from '@/queries/useChat';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PlaygroundInput } from './playground-input';

export function PlaygroundInputHomePage() {
  const [value, setValue] = useState<string>('');
  const router = useRouter();
  const createChatMutation = useCreateChatMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) return;

    createChatMutation.mutate(
      { title: value },
      {
        onSuccess: (data) => {
          const chatId = data.data.data.id;
          // Persist the first message so it can be sent after redirect
          if (typeof window !== 'undefined') {
            localStorage.setItem('pendingMessage', value);
          }
          router.push(`/dashboard/playground/${chatId}`);
        },
        onError: (error) => {
          handleErrorApi({ error });
        },
      },
    );
  };

  return (
    <DragDropProvider>
      <PlaygroundInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={handleSubmit}
        disabled={false}
        submitDisabled={createChatMutation.isPending}
        initialAttachments={[]}
      />
    </DragDropProvider>
  );
}
