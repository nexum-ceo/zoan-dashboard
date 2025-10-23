import agentApiRequest from '@/api-requests/agent';
import { useQuery } from '@tanstack/react-query';
import { AGENT_KEYS } from '../key';

export const useGetAgentList = () => {
  return useQuery({
    queryKey: AGENT_KEYS.agents,
    queryFn: () => agentApiRequest.sList(),
  });
};

export const useGetSpecificAgent = (id: string) => {
  return useQuery({
    queryKey: AGENT_KEYS.agent(id),
    queryFn: () => agentApiRequest.sGetAgent(id),
  });
};

export const useGetAgentAvailable = () => {
  return useQuery({
    queryKey: AGENT_KEYS.agentAvailable,
    queryFn: () => agentApiRequest.sGetAgentAvailable(),
  });
};

export const useGetInstalledAgent = () => {
  return useQuery({
    queryKey: AGENT_KEYS.agentInstalled,
    queryFn: () => agentApiRequest.sGetInstalledAgent(),
  });
};
