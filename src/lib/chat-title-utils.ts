/**
 * Client-side utility to update chat title in the frontend
 * This should be called after the webhook successfully updates the backend
 */

import { GetChatListResType, GetSpecificChatResType } from '@/types/chat';
import { InfiniteData, QueryClient } from '@tanstack/react-query';

export const updateChatTitleInCache = (
  queryClient: QueryClient,
  chatId: string,
  newTitle: string,
) => {
  // Update the specific chat in cache
  queryClient.setQueryData<GetSpecificChatResType>(
    ['chat', chatId],
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          title: newTitle,
        },
      };
    },
  );

  // Update the chat in the infinite chat list
  queryClient.setQueryData<InfiniteData<GetChatListResType>>(
    ['chat-list-infinite'],
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((chat) =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat,
          ),
        })),
      };
    },
  );
};
