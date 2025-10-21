import axiosInstance from '@/lib/axios-instance';
import { UserProfileResType, UserProfileUpdateType } from '@/types/user';

const userApiRequest = {
  getCurrentUserProfile: () => axiosInstance.get<UserProfileResType>(`/me`),
  sGetUserProfile: () =>
    axiosInstance.get<UserProfileResType>(`/user/me`, {
      baseURL: '',
    }),

  updateUserById: (userId: string, body: UserProfileUpdateType) =>
    axiosInstance.put<UserProfileResType>(`/user/${userId}`, body),
  sUpdateUserById: (userId: string, body: UserProfileUpdateType) =>
    axiosInstance.put<UserProfileResType>(`/user/${userId}`, body, {
      baseURL: '',
    }),

  checkUsernameExists: (username: string) =>
    axiosInstance.get<boolean>(
      `/user/is-existing-username?username=${username}`,
    ),
  sCheckUsernameExists: (username: string) =>
    axiosInstance.get<boolean>(
      `/user/is-existing-username?username=${username}`,
      {
        baseURL: '',
      },
    ),
};

export default userApiRequest;
