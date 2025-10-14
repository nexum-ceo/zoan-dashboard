'use client';
import { useChatTitleUpdates } from '@/hooks/useChatTitleUpdates';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import React from 'react';

function ChatTitleUpdateListener() {
  useChatTitleUpdates();
  return null;
}

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ChatTitleUpdateListener />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
