'use client';

import chatApiRequest from '@/api-requests/chat';
import {
  CreateChatAgentSettingBodyType,
  GetChatListResType,
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

export const useInfiniteChatList = (initialLimit = 10) => {
  return useInfiniteQuery<GetChatListResType, Error>({
    queryKey: ['chat-list-infinite', initialLimit],
    queryFn: ({ pageParam }) => {
      const { offset = 0, limit = initialLimit } = (pageParam ?? {}) as {
        offset?: number;
        limit?: number;
      };
      return chatApiRequest
        .sListInfinite({ offset, limit })
        .then((r) => r.data);
    },
    initialPageParam: { offset: 0, limit: initialLimit },
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage;
      const nextOffset = meta.offset + meta.limit;
      if (nextOffset >= meta.total) return undefined;
      return { offset: nextOffset, limit: meta.limit };
    },
  });
};

export const useCreateChatMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApiRequest.sAdd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-list'] });
    },
  });
};

export const useGetChatMessages = (id: string) => {
  return useQuery({
    queryKey: ['chat-messages', id],
    queryFn: () => chatApiRequest.sGetChatMessages(id),
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
