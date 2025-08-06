import workflowApiRequest from '@/api-requests/workflow';
import { CreateWorkflowType } from '@/types/workflow';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetWorkflowList = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowApiRequest.sList(),
  });
};

export const useCreateWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkflowType) => workflowApiRequest.sAdd(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
};

export const useDeleteWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowApiRequest.sDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
};
