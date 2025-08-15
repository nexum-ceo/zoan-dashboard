'use client';

import chatApiRequest from '@/api-requests/chat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useChatList = () => {
  return useQuery({
    queryKey: ['chat-list'],
    queryFn: chatApiRequest.sList,
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
