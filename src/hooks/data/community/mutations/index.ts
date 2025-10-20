import communityApiRequest from '@/api-requests/community';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { COMMUNITY_KEYS } from '../key';

export const useInstallCommunityAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communityApiRequest.sInstallCommunityAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_KEYS.communityAgent,
      });
    },
  });
};
