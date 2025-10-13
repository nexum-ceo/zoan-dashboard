import userApiRequest from '@/api-requests/user';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userApiRequest.sGetUserProfile(userId),
  });
};

export const useCurrentUserProfile = () => {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => userApiRequest.getCurrentUserProfile(),
    enabled: status === 'authenticated' && !!session?.accessToken,
  });
};
