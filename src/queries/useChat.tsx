'use client';

import chatApiRequest from '@/api-requests/chat';
import {
  CreateChatAgentSettingBodyType,
  PresignedUrlBodyType,
} from '@/types/chat';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const useChatList = () => {
  return useQuery({
    queryKey: ['chat-list'],
    queryFn: chatApiRequest.sList,
  });
};

export const useInfiniteChatList = () => {
  return useInfiniteQuery({
    queryKey: ['chat-list-infinite'],
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

export const useCreateChatMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApiRequest.sAdd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-list-infinite'] });
    },
  });
};

export const useGetChatMessagesInfinite = (id: string) => {
  return useInfiniteQuery({
    queryKey: ['chat-messages-infinite', id],
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
    queryKey: ['chat', id],
    queryFn: () => chatApiRequest.sGetChat(id),
  });
};

export const useGetPrimaryAgentByChatId = (id: string) => {
  return useQuery({
    queryKey: ['primary-agent-by-chat-id', id],
    queryFn: () => chatApiRequest.sGetPrimaryAgentByChatId(id),
    enabled: !!id,
  });
};

export const useGetChatAgentSettingByChatId = (id: string) => {
  return useQuery({
    queryKey: ['chat-agent-setting-by-chat-id', id],
    queryFn: () => chatApiRequest.sGetChatAgentSettingByChatId(id),
    enabled: !!id,
  });
};

export const useCreateChatAgentSettingMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateChatAgentSettingBodyType) =>
      chatApiRequest.sCreateChatAgentSetting(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chat-agent-setting-by-chat-id', id],
      });
    },
  });
};

export const useGetChatGameVersionList = (id: string) => {
  return useQuery({
    queryKey: ['chat-game-version-list', id],
    queryFn: () => chatApiRequest.sGetChatGameVersionList(id),
    enabled: !!id,
  });
};

export const useGetChatPresignedUrl = (id: string) => {
  return useMutation({
    mutationFn: (body: PresignedUrlBodyType) =>
      chatApiRequest.sGetPresignedUrl(id, body),
  });
};

export const useDeleteFileMutation = (id: string) => {
  return useMutation({
    mutationFn: (path: string) => chatApiRequest.sDeleteFile(id, path),
  });
};
