import libraryApiRequest from '@/api-requests/library';
import { useQuery } from '@tanstack/react-query';
import { LIBRARY_KEYS } from '../key';

export const useGetListFileOfUser = (userId: string) => {
  return useQuery({
    queryKey: LIBRARY_KEYS.listFileOfUser(userId),
    queryFn: () => libraryApiRequest.sGetListFileOfUser(userId),
    enabled: !!userId,
  });
};

export const useGetListFolder = (userId: string) => {
  return useQuery({
    queryKey: LIBRARY_KEYS.listFolder(userId),
    queryFn: () => libraryApiRequest.sGetListFolder(userId),
    enabled: !!userId,
  });
};

export const useGetListFileInFolder = (userId: string, folderPath: string) => {
  return useQuery({
    queryKey: LIBRARY_KEYS.listFileInFolder(userId, folderPath),
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

export const useGetListFileInGameFolder = (gameUrl: string) => {
  return useQuery({
    queryKey: LIBRARY_KEYS.listFileInGameFolder(gameUrl),
    queryFn: () => libraryApiRequest.sGetListFileInGameFolder(gameUrl),
    enabled: !!gameUrl,
  });
};

// Hook for fetching content from subfolders
export const useGetGameFolderContent = (
  gameUrl: string,
  folderPath: string = '',
) => {
  return useQuery({
    queryKey: LIBRARY_KEYS.gameFolderContent(gameUrl, folderPath),
    queryFn: () => libraryApiRequest.sGetGameFolderContent(gameUrl, folderPath),
    enabled: !!gameUrl,
  });
};

export const useGetPublicAssets = (folderPath: string = '') => {
  return useQuery({
    queryKey: LIBRARY_KEYS.publicAssets(folderPath),
    queryFn: () => libraryApiRequest.sGetPublicAssets(folderPath),
    enabled: true, // Always enabled since it's public
  });
};
