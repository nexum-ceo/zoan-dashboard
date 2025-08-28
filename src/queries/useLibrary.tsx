import libraryApiRequest from '@/api-requests/library';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useLibrary = () => {
  return useMutation({
    mutationFn: libraryApiRequest.sGetPresignedUrls,
  });
};

export const useGetListFileOfUser = (userId: string) => {
  return useQuery({
    queryKey: ['list-file-of-user', userId],
    queryFn: () => libraryApiRequest.sGetListFileOfUser(userId),
    enabled: !!userId,
  });
};

export const useGetListFolder = (userId: string) => {
  return useQuery({
    queryKey: ['list-folder', userId],
    queryFn: () => libraryApiRequest.sGetListFolder(userId),
    enabled: !!userId,
  });
};

export const useGetListFileInFolder = (userId: string, folderPath: string) => {
  return useQuery({
    queryKey: ['list-file-in-folder', userId, folderPath],
    queryFn: () => {
      if (!userId) return null;
      if (folderPath === 'all') {
        return libraryApiRequest.sGetListFileOfUser(userId);
      }
      return libraryApiRequest.sGetListFileInFolder(userId, folderPath);
    },
    enabled: !!userId,
  });
};
