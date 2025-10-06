import axiosInstance from '@/lib/axios-instance';
import { TCommunityAgentRes } from '@/types/community';

const communityApiRequest = {
  getCommunityAgent: () =>
    axiosInstance.get<TCommunityAgentRes>('/community/agents'),
  sGetCommunityAgent: () =>
    axiosInstance.get<TCommunityAgentRes>('/community/agents', { baseURL: '' }),
  getCommunityAgentBackend: () =>
    axiosInstance.get<TCommunityAgentRes>('/community/agents'),

  sInstallCommunityAgent: (agentId: string) =>
    axiosInstance.post(
      `/community/install/${agentId}`,
      { agentId },
      { baseURL: '' },
    ),
  installCommunityAgentBackend: (agentId: string) =>
    axiosInstance.post(`/community/install/${agentId}`),
};

export default communityApiRequest;
