import communityApiRequest from '@/api-requests/community';
import { useQuery } from '@tanstack/react-query';
import { COMMUNITY_KEYS } from '../key';

export const useGetCommunityAgent = () => {
  return useQuery({
    queryKey: COMMUNITY_KEYS.communityAgent,
    queryFn: () => communityApiRequest.sGetCommunityAgent(),
    retry: false,
    refetchOnWindowFocus: false,
  });
};
