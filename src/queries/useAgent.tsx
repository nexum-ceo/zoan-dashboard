import agentApiRequest from '@/api-requests/agent';
import { CreateAgentBodyType, UpdateAgentBodyType } from '@/types/agent';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetAgentList = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => agentApiRequest.sList(),
  });
};

export const useCreateAgentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAgentBodyType) => agentApiRequest.sAdd(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useGetSpecificAgent = (id: string) => {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentApiRequest.sGetAgent(id),
  });
};

export const useUpdateAgentMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAgentBodyType) => agentApiRequest.sUpdate(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['primary-agent-by-chat-id', id],
      });
    },
  });
};

export const useGetAgentAvailable = () => {
  return useQuery({
    queryKey: ['agent-available'],
    queryFn: () => agentApiRequest.sGetAgentAvailable(),
  });
};
