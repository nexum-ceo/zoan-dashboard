import providerApiRequest from '@/api-requests/provider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PROVIDER_KEYS } from '../key';

export const useAddProviderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: providerApiRequest.sAdd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROVIDER_KEYS.providerUser });
    },
  });
};
