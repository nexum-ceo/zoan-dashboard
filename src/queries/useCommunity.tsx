import communityApiRequest from '@/api-requests/community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetCommunityAgent = () => {
  return useQuery({
    queryKey: ['communityAgent'],
    queryFn: () => communityApiRequest.sGetCommunityAgent(),
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useInstallCommunityAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communityApiRequest.sInstallCommunityAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityAgent'] });
    },
  });
};
