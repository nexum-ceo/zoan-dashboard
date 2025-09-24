import { useCallback, useState } from 'react';

type FileContents = Record<string, string>;

export const useFileContent = () => {
  const [fileContents, setFileContents] = useState<FileContents>({});

  const fetchFileContent = useCallback(
    async (fileKey: string): Promise<string> => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || '';
        const fileUrl = `${baseUrl}/games/${fileKey}`;
        const response = await fetch(fileUrl);

        if (response.ok) {
          const content = await response.text();
          console.log(
            `Fetched content for file ${fileKey}:`,
            content.substring(0, 100) + '...',
          );
          return content;
        } else {
          console.warn(
            `Failed to fetch content for file ${fileKey}:`,
            response.status,
          );
          return `// Error: Could not fetch content for ${fileKey}\n// Status: ${response.status}`;
        }
      } catch (error) {
        console.error(`Error fetching content for file ${fileKey}:`, error);
        return `// Error: Could not fetch content for ${fileKey}\n// Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
      }
    },
    [],
  );

  const loadFileContent = useCallback(
    async (fileKey: string) => {
      if (fileContents[fileKey]) return fileContents[fileKey];

      const content = await fetchFileContent(fileKey);
      setFileContents((prev) => ({
        ...prev,
        [fileKey]: content,
      }));
      return content;
    },
    [fileContents, fetchFileContent],
  );

  const getFileContent = useCallback(
    (fileKey: string) => fileContents[fileKey] || null,
    [fileContents],
  );

  return {
    fileContents,
    fetchFileContent,
    loadFileContent,
    getFileContent,
    setFileContents,
  };
};
