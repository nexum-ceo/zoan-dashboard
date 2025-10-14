'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

interface ChatTitleUpdateEvent {
  type: 'chat-title-update' | 'connected' | 'ping';
  chatId?: string;
  title?: string;
}

export function useChatTitleUpdates() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource('/api/webhooks/broadcast-chat-update');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: ChatTitleUpdateEvent = JSON.parse(event.data);

        if (data.type === 'chat-title-update' && data.chatId) {
          console.log(`Chat title updated: ${data.chatId} -> ${data.title}`);

          // Invalidate queries to refresh the UI
          queryClient.invalidateQueries({
            queryKey: ['chat', data.chatId],
          });
          queryClient.invalidateQueries({
            queryKey: ['chat-list-infinite'],
          });
          queryClient.invalidateQueries({
            queryKey: ['chat-list'],
          });
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  return null;
}
