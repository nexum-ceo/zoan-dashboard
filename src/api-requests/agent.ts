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
  sUpdate: (id: string, body: UpdateAgentBodyType) =>
    axiosInstance.put<CreateAgentResType>(`/agent/${id}`, body, {
      baseURL: '',
    }),
  getAgent: (id: string) =>
    axiosInstance.get<GetSpecificAgentResType>(`/agent/${id}`),
  sGetAgent: (id: string) =>
    axiosInstance.get<GetSpecificAgentResType>(`/agent/${id}`, {
      baseURL: '',
    }),
  getAgentAvailable: () =>
    axiosInstance.get<GetAgentResType>('/agent/available'),
  sGetAgentAvailable: () =>
    axiosInstance.get<GetAgentResType>('/agent/available', {
      baseURL: '',
    }),

  getInstalledAgent: () =>
    axiosInstance.get<GetAgentResType>('/agent/installed'),
  sGetInstalledAgent: () =>
    axiosInstance.get<GetAgentResType>('/agent/installed', {
      baseURL: '',
    }),
};

export default agentApiRequest;
