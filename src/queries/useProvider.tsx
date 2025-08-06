import providerApiRequest from '@/api-requests/provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useProviderList = () => {
  return useQuery({
    queryKey: ['providers'],
    queryFn: providerApiRequest.sList,
  });
};

export const useAddProviderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: providerApiRequest.sAdd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-user'] });
    },
  });
};

export const useProviderOfUserList = () => {
  return useQuery({
    queryKey: ['provider-user'],
    queryFn: providerApiRequest.sGetProviderOfUser,
  });
};
