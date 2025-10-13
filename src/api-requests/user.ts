import axiosInstance from '@/lib/axios-instance';
import { UserProfileResType } from '@/types/user';

const userApiRequest = {
  getCurrentUserProfile: () => axiosInstance.get<UserProfileResType>(`/me`),
  sGetUserProfile: () =>
    axiosInstance.get<UserProfileResType>(`/user/me`, {
      baseURL: '',
    }),
};

export default userApiRequest;
