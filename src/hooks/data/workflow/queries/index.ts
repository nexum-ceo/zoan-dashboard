import workflowApiRequest from '@/api-requests/workflow';
import { useQuery } from '@tanstack/react-query';
import { WORKFLOW_KEYS } from '../key';

export const useGetWorkflowList = () => {
  return useQuery({
    queryKey: WORKFLOW_KEYS.workflows,
    queryFn: () => workflowApiRequest.sList(),
  });
};
