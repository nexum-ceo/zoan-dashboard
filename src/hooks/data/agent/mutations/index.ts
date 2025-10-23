import agentApiRequest from '@/api-requests/agent';
import { CreateAgentBodyType, UpdateAgentBodyType } from '@/types/agent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
        queryKey: AGENT_KEYS.agentAvailable,
      });
      queryClient.invalidateQueries({
        queryKey: AGENT_KEYS.agents,
      });
    },
  });
};
