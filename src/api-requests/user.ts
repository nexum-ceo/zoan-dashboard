import axiosInstance from '@/lib/axios-instance';
import { UserProfileResType } from '@/types/user';

const userApiRequest = {
  getCurrentUserProfile: (userId: string) =>
    axiosInstance.get<UserProfileResType>(`/user/${userId}`),
  sGetUserProfile: (userId: string) =>
    axiosInstance.get<UserProfileResType>(`/user/${userId}`, {
      baseURL: '',
    }),
};

export default userApiRequest;
