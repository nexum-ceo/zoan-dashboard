import userApiRequest from '@/api-requests/user';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useCurrentUserProfile = () => {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => userApiRequest.sGetUserProfile(session?.user?.id as string),
    enabled: status === 'authenticated' && !!session?.accessToken,
  });
};
