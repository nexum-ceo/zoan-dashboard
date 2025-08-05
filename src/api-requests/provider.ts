import axiosInstance from '@/lib/axios-instance';
import {
  CreateProviderBodyType,
  CreateProviderResType,
  GetProviderOfUserResType,
  GetProviderResType,
} from '@/types/provider';

const providerApiRequest = {
  list: () => axiosInstance.get<GetProviderResType>('/provider'),
  sList: () =>
    axiosInstance.get<GetProviderResType>('/provider', {
      baseURL: '',
    }),
  add: (body: CreateProviderBodyType) =>
    axiosInstance.post<CreateProviderResType>('/provider', body),
  sAdd: (body: CreateProviderBodyType) =>
    axiosInstance.post<CreateProviderResType>('/provider', body, {
      baseURL: '',
    }),
  getProviderOfUser: () =>
    axiosInstance.get<GetProviderOfUserResType>(`/provider/list`),
  sGetProviderOfUser: () =>
    axiosInstance.get<GetProviderOfUserResType>(`/provider-user`, {
      baseURL: '',
    }),
};

export default providerApiRequest;
