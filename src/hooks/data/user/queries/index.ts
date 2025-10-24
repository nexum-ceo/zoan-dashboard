import userApiRequest from '@/api-requests/user';
import { USER_KEYS } from '@/hooks/data/user';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useCurrentUserProfile = () => {
  const { status } = useSession();

  return useQuery({
    queryKey: USER_KEYS.currentUserProfile,
    queryFn: () => userApiRequest.sGetUserProfile(),
    enabled: status === 'authenticated',
  });
};

export const useCheckUsernameExists = (username: string) => {
  return useQuery({
    queryKey: USER_KEYS.checkUsernameExists(username),
    queryFn: () => userApiRequest.sCheckUsernameExists(username),
    enabled: !!username,
  });
};
