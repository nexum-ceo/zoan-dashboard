import workflowApiRequest from '@/api-requests/workflow';
import { CreateWorkflowType } from '@/types/workflow';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WORKFLOW_KEYS } from '../key';

export const useCreateWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkflowType) => workflowApiRequest.sAdd(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_KEYS.workflows });
    },
  });
};

export const useDeleteWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowApiRequest.sDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOW_KEYS.workflows });
    },
  });
};
