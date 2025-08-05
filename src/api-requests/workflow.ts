import axiosInstance from '@/lib/axios-instance';
import {
  CreateWorkflowResType,
  CreateWorkflowType,
  GetWorkflowResType,
} from '@/types/workflow';

const workflowApiRequest = {
  list: () => axiosInstance.get<GetWorkflowResType>('/workflow'),
  sList: () =>
    axiosInstance.get<GetWorkflowResType>('/workflow', {
      baseURL: '',
    }),
  add: (body: CreateWorkflowType) =>
    axiosInstance.post<CreateWorkflowResType>('/workflow', body),
  sAdd: (body: CreateWorkflowType) =>
    axiosInstance.post<CreateWorkflowResType>('/workflow', body, {
      baseURL: '',
    }),
  delete: (id: string) =>
    axiosInstance.delete<CreateWorkflowResType>(`/workflow/${id}`),
  sDelete: (id: string) =>
    axiosInstance.delete<CreateWorkflowResType>(`/workflow/${id}`, {
      baseURL: '',
    }),
};

export default workflowApiRequest;
