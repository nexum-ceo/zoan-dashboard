import userApiRequest from '@/api-requests/user';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useCurrentUserProfile = () => {
  const { status } = useSession();

  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => userApiRequest.sGetUserProfile(),
    // We call Next.js API route /api/user/me which uses server session, so
    // don't block on client-side accessToken being present
    enabled: status === 'authenticated',
  });
};
