import chatApiRequest from '@/api-requests/chat';
import {
  CreateChatAgentSettingBodyType,
  PresignedUrlBodyType,
  UpdateChatTitleBodyType,
} from '@/types/chat';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CHAT_KEYS } from '../key';

export const useCreateChatMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApiRequest.sAdd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.chatListInfinite });
    },
  });
};

export const useCreateChatAgentSettingMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateChatAgentSettingBodyType) =>
      chatApiRequest.sCreateChatAgentSetting(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.chatAgentSettingByChatId(id),
      });
    },
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

export const useUpdateChatTitleMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateChatTitleBodyType) =>
      chatApiRequest.sUpdateChatTitle(id, body),
    onSuccess: () => {
      // Invalidate both the specific chat and the chat list to refresh the UI
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.chat(id) });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.chatListInfinite });
    },
  });
};
