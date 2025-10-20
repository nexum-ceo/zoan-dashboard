import userApiRequest from '@/api-requests/user';
import { UserProfileUpdateType } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useCurrentUserProfile = () => {
  const { status } = useSession();

  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => userApiRequest.sGetUserProfile(),
    enabled: status === 'authenticated',
  });
};

export const useUpdateUserProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string;
      body: UserProfileUpdateType;
    }) => userApiRequest.sUpdateUserById(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
    },
  });
};

export const useCheckUsernameExists = (username: string) => {
  return useQuery({
    queryKey: ['is-existing-username', username],
    queryFn: () => userApiRequest.sCheckUsernameExists(username),
    enabled: !!username,
  });
};

export const useCheckUsernameExistsMutation = () => {
  return useMutation({
    mutationFn: async (username: string): Promise<boolean> => {
      const res = await userApiRequest.sCheckUsernameExists(username);
      return res.data;
    },
  });
};
