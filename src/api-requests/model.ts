import axiosInstance from '@/lib/axios-instance';
import { GetModelResType } from '@/types/provider';

const modelApiRequest = {
  getModel: (name: string) =>
    axiosInstance.get<GetModelResType>(`/provider/model/${name}`),
  sGetModel: (name: string) =>
    axiosInstance.post<GetModelResType>(
      `/model`,
      { name },
      {
        baseURL: '',
      },
    ),
};

export default modelApiRequest;
