import libraryApiRequest from '@/api-requests/library';
import { useMutation } from '@tanstack/react-query';

export const useLibrary = () => {
  return useMutation({
    mutationFn: libraryApiRequest.sGetPresignedUrls,
  });
};

export const useDelete = () => {
  return useMutation({
    mutationFn: libraryApiRequest.sDeleteFile,
  });
};
