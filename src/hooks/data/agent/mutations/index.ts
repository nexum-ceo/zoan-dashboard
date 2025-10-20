import agentApiRequest from '@/api-requests/agent';
import { CreateAgentBodyType, UpdateAgentBodyType } from '@/types/agent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CHAT_KEYS } from '../../chat/key';
import { AGENT_KEYS } from '../key';

export const useCreateAgentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAgentBodyType) => agentApiRequest.sAdd(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENT_KEYS.agents });
    },
  });
};

export const useUpdateAgentMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAgentBodyType) =>
      agentApiRequest.sUpdate(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.primaryAgentByChatId(id),
      });
      queryClient.invalidateQueries({
        queryKey: AGENT_KEYS.agentAvailable,
      });
      queryClient.invalidateQueries({
        queryKey: AGENT_KEYS.agents,
      });
    },
  });
};
