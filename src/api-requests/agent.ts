import axiosInstance from '@/lib/axios-instance';
import {
  CreateAgentBodyType,
  CreateAgentResType,
  GetAgentResType,
  GetSpecificAgentResType,
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
  sUpdate: (body: UpdateAgentBodyType) =>
    axiosInstance.put<CreateAgentResType>(`/agent`, body, {
      baseURL: '',
    }),
  getAgent: (id: string) =>
    axiosInstance.get<GetSpecificAgentResType>(`/agent/${id}`),
  sGetAgent: (id: string) =>
    axiosInstance.get<GetSpecificAgentResType>(`/agent/${id}`, {
      baseURL: '',
    }),
};

export default agentApiRequest;
