import axiosInstance from '@/lib/axios-instance';
import { UserProfileResType } from '@/types/user';

const userApiRequest = {
  getUserProfile: (userId: string) =>
    axiosInstance.get<UserProfileResType>(`/user/${userId}`),
  sGetUserProfile: (userId: string) =>
    axiosInstance.get<UserProfileResType>(`/user/${userId}`, {
      baseURL: '',
    }),
  getCurrentUserProfile: () => axiosInstance.get<UserProfileResType>('/me'),
};

export default userApiRequest;
