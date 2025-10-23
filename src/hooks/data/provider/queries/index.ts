import providerApiRequest from '@/api-requests/provider';
import { useQuery } from '@tanstack/react-query';
import { PROVIDER_KEYS } from '../key';

export const useProviderList = () => {
  return useQuery({
    queryKey: PROVIDER_KEYS.providers,
    queryFn: providerApiRequest.sList,
  });
};

export const useProviderOfUserList = () => {
  return useQuery({
    queryKey: PROVIDER_KEYS.providerUser,
    queryFn: providerApiRequest.sGetProviderOfUser,
  });
};
