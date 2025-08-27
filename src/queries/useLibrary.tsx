import libraryApiRequest from '@/api-requests/library';
import { useMutation, useQueries } from '@tanstack/react-query';

export const useLibrary = () => {
  return useMutation({
    mutationFn: libraryApiRequest.sGetPresignedUrls,
  });
};

export const useGetListFileOfUser = () => {
  return useMutation({
    mutationFn: libraryApiRequest.getListFileOfUser,
  });
};

export const useGetListFolder = (userId: string) => {
  return useQueries({
    queries: [
      {
        queryKey: ['list-folder', userId],
        queryFn: () => libraryApiRequest.getListFolder(userId),
        enabled: !!userId,
      },
    ],
  });
};

export const useGetListFile = (userId: string, folderPath: string) => {
  return useQueries({
    queries: [
      {
        queryKey: ['list-file-in-folder', userId, folderPath],
        queryFn: () => {
          if (!userId) return null;
          if (folderPath === 'all') {
            return libraryApiRequest.getListFileOfUser(userId);
          }
          return libraryApiRequest.getListFileInFolder(userId, folderPath);
        },
        enabled: !!userId,
      },
    ],
  });
};
