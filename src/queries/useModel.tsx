import modelApiRequest from '@/api-requests/model';
import { useMutation } from '@tanstack/react-query';

export const useGetModelByName = () => {
  return useMutation({
    mutationFn: (name: string) => modelApiRequest.sGetModel(name),
  });
};
