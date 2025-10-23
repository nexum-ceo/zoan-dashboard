import type { S3ListBucketResultType } from '@/types/library';
import { useCallback, useState } from 'react';

type FolderContents = Record<string, S3ListBucketResultType>;

export const useFolderContent = (chatId: string, version: string) => {
  const [folderContents, setFolderContents] = useState<FolderContents>({});

  const fetchFolderContent = useCallback(
    async (folderName: string) => {
      if (folderContents[folderName]) return; // Already fetched

      try {
        const response = await fetch(
          `/api/games/${chatId}/${version}/${folderName}`,
        );
        if (response.ok) {
          const data = await response.json();
          setFolderContents((prev) => ({
            ...prev,
            [folderName]: data,
          }));
          console.log(`Fetched content for folder ${folderName}:`, data);
        }
      } catch (error) {
        console.error(
          `Error fetching content for folder ${folderName}:`,
          error,
        );
      }
    },
    [folderContents, chatId, version],
  );

  const getFolderContent = useCallback(
    (folderName: string) => folderContents[folderName] || null,
    [folderContents],
  );

  const loadFolderContent = useCallback(
    async (folderName: string) => {
      if (folderContents[folderName]) return folderContents[folderName];

      await fetchFolderContent(folderName);
      return folderContents[folderName];
    },
    [folderContents, fetchFolderContent],
  );

  return {
    folderContents,
    fetchFolderContent,
    getFolderContent,
    loadFolderContent,
    setFolderContents,
  };
};
