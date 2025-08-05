import axiosInstance from '@/lib/axios-instance';
import {
  CreateAgentBodyType,
  CreateAgentResType,
  GetAgentResType,
  UpdateAgentBodyType,
} from '@/types/agent';

const agentApiRequest = {
  list: () => axiosInstance.get<GetAgentResType>('/agent'),
  sList: () =>
    axiosInstance.get<GetAgentResType>('/agent', {
      baseURL: '',
    }),
  add: (body: CreateAgentBodyType) =>
    axiosInstance.post<CreateAgentResType>('/agent', body),
  sAdd: (body: CreateAgentBodyType) =>
    axiosInstance.post<CreateAgentResType>('/agent', body, {
      baseURL: '',
    }),
  update: (id: string, body: UpdateAgentBodyType) =>
    axiosInstance.put<CreateAgentResType>(`/agent/${id}`, body),
  sUpdate: (id: string, body: UpdateAgentBodyType) =>
    axiosInstance.put<CreateAgentResType>(`/agent/${id}`, body, {
      baseURL: '',
    }),
};

export default agentApiRequest;
