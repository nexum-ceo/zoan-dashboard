import userApiRequest from '@/api-requests/user';
import { UserProfileUpdateType } from '@/types/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

export const useCheckUsernameExistsMutation = () => {
  return useMutation({
    mutationFn: async (username: string): Promise<boolean> => {
      const res = await userApiRequest.sCheckUsernameExists(username);
      return res.data;
    },
  });
};
