'use client';

import chatApiRequest from '@/api-requests/chat';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { CHAT_KEYS } from '../key';

export const useChatList = () => {
  return useQuery({
    queryKey: CHAT_KEYS.chatList,
    queryFn: chatApiRequest.sList,
  });
};

export const useInfiniteChatList = () => {
  return useInfiniteQuery({
    queryKey: CHAT_KEYS.chatListInfinite,
    queryFn: ({ pageParam = 0 }) =>
      chatApiRequest.sListInfinite({ offset: Number(pageParam), limit: 10 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const meta = lastPage?.data?.meta;
      const inferredLimit = Number(meta?.limit) || 10;
      const total = Number(meta?.total ?? 0);
      const currentOffset = Number(
        meta?.offset ?? (allPages.length - 1) * inferredLimit,
      );
      const pageLength = lastPage?.data?.data?.length ?? 0;
      const nextOffset = currentOffset + inferredLimit;
      if (total > 0) {
        if (nextOffset >= total) return undefined;
        return nextOffset;
      }
      if (pageLength < inferredLimit) return undefined;
      return nextOffset;
    },
  });
};

export const useGetChatMessagesInfinite = (id: string) => {
  return useInfiniteQuery({
    queryKey: CHAT_KEYS.chatMessagesInfinite(id),
    queryFn: ({ pageParam = 0 }) =>
      chatApiRequest.sGetChatMessages(id, {
        offset: Number(pageParam),
        limit: 10,
      }),
    initialPageParam: 0,
    enabled: !!id,
    getNextPageParam: (lastPage, allPages) => {
      const meta = lastPage?.data?.meta;
      const inferredLimit = Number(meta?.limit) || 10;
      const total = Number(meta?.total ?? 0);
      const currentOffset = Number(
        meta?.offset ?? (allPages.length - 1) * inferredLimit,
      );
      const pageLength = lastPage?.data?.data?.length ?? 0;
      const nextOffset = currentOffset + inferredLimit;
      if (total > 0) {
        if (nextOffset >= total) return undefined;
        return nextOffset;
      }
      if (pageLength < inferredLimit) return undefined;
      return nextOffset;
    },
  });
};

export const useGetChat = (id: string) => {
  return useQuery({
    queryKey: CHAT_KEYS.chat(id),
    queryFn: () => chatApiRequest.sGetChat(id),
  });
};

export const useGetPrimaryAgentByChatId = (id: string) => {
  return useQuery({
    queryKey: CHAT_KEYS.primaryAgentByChatId(id),
    queryFn: () => chatApiRequest.sGetPrimaryAgentByChatId(id),
    enabled: !!id,
  });
};

export const useGetChatAgentSettingByChatId = (id: string) => {
  return useQuery({
    queryKey: CHAT_KEYS.chatAgentSettingByChatId(id),
    queryFn: () => chatApiRequest.sGetChatAgentSettingByChatId(id),
    enabled: !!id,
  });
};

export const useGetChatGameVersionList = (id: string) => {
  return useQuery({
    queryKey: CHAT_KEYS.chatGameVersionList(id),
    queryFn: () => chatApiRequest.sGetChatGameVersionList(id),
    enabled: !!id,
  });
};
