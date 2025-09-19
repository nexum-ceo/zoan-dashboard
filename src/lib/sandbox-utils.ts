import type { S3ListBucketResultType } from '@/types/library';
import { extractS3CommonPrefixes, extractS3Contents } from './s3';

export type SandboxFile = {
  code: string;
};

export type TreeNode = {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
};

export type SandboxFiles = Record<string, SandboxFile>;

const TEXT_EXTENSIONS = ['js', 'ts', 'tsx', 'jsx', 'json', 'css', 'html', 'md'];

export const createDefaultPackageJson = () => {
  return JSON.stringify(
    {
      name: 'sandbox-app',
      version: '0.1.0',
      private: true,
      dependencies: {},
    },
    null,
    2,
  );
};

export const createLoadingContent = (
  fileName: string,
  fileKey: string,
  size?: number,
  lastModified?: string,
  folderName?: string,
) => {
  const folderInfo = folderName ? ` (from ${folderName} folder)` : '';
  return `// Loading content for ${fileName}...\n// File: ${fileName}${folderInfo}\n// Key: ${fileKey}\n// Size: ${
    size || 'unknown'
  } bytes\n// Last Modified: ${
    lastModified || 'unknown'
  }\n\n// This content will be loaded from MinIO\nconsole.log('Loading ${fileName}...');`;
};

export const processS3FilesToSandbox = (
  s3Data: S3ListBucketResultType | undefined,
  chatId: string,
  version: string,
  fileContents: Record<string, string>,
  folderContents: Record<string, S3ListBucketResultType>,
): SandboxFiles => {
  const defaults: SandboxFiles = {};

  if (!s3Data) return defaults;

  const contents = extractS3Contents(s3Data);
  const folders = extractS3CommonPrefixes(s3Data);

  // strip `${chatId}/${version}/` prefix
  const prefix = `${chatId}/${version}/`;
  const filesFromS3: SandboxFiles = {};

  // Process files in current directory
  contents
    .filter((item) => typeof item.key === 'string' && !item.key.endsWith('/'))
    .forEach((item) => {
      const rel = item.key.startsWith(prefix)
        ? item.key.slice(prefix.length)
        : item.key;
      const path = `/${rel}`;
      const ext = (rel.split('.').pop() || '').toLowerCase();

      if (!TEXT_EXTENSIONS.includes(ext)) {
        return; // skip non-text files at initial map
      }

      // Check if we already have content for this file
      const fileKey = item.key;
      let content = fileContents[fileKey];

      if (!content) {
        // For package.json, create a default if not found, but still try to fetch real content
        if (rel.toLowerCase() === 'package.json') {
          content = createDefaultPackageJson();
        } else {
          content = createLoadingContent(
            rel,
            fileKey,
            item.size,
            item.lastModified,
          );
        }
      }

      filesFromS3[path] = { code: content };
    });

  // Process folders - add files from subfolders
  folders.forEach((folder) => {
    const folderName = folder.folderName;

    // Check if we have content for this folder
    const folderContent = folderContents[folderName];

    if (folderContent) {
      // Use actual content from folder
      const folderFiles = extractS3Contents(folderContent);

      folderFiles
        .filter(
          (item) => typeof item.key === 'string' && !item.key.endsWith('/'),
        )
        .forEach((item) => {
          const rel = item.key.startsWith(folder.prefix)
            ? item.key.slice(folder.prefix.length)
            : item.key;
          const path = `/${folderName}/${rel}`;
          const ext = (rel.split('.').pop() || '').toLowerCase();

          if (TEXT_EXTENSIONS.includes(ext)) {
            const fileKey = item.key;
            const content =
              fileContents[fileKey] ||
              createLoadingContent(
                rel,
                fileKey,
                item.size,
                item.lastModified,
                folderName,
              );

            filesFromS3[path] = { code: content };
          }
        });
    }
    // We will not create placeholder files for empty folders - let Sandpack handle empty folders
  });

  const result = { ...defaults, ...filesFromS3 };
  return result;
};

export const selectActiveFile = (sandboxFiles: SandboxFiles): string => {
  const allFiles = Object.keys(sandboxFiles);

  if (allFiles.length === 0) {
    return '/index.html'; // Default fallback
  }

  // Prefer index files
  const indexFiles = allFiles.filter(
    (key) => key.includes('index') || key.includes('main'),
  );
  if (indexFiles.length > 0) {
    return indexFiles[0];
  }

  // Prefer HTML files
  const htmlFiles = allFiles.filter((key) => key.endsWith('.html'));
  if (htmlFiles.length > 0) {
    return htmlFiles[0];
  }

  // Prefer JS/TS files
  const jsFiles = allFiles.filter(
    (key) =>
      key.endsWith('.js') ||
      key.endsWith('.ts') ||
      key.endsWith('.jsx') ||
      key.endsWith('.tsx'),
  );
  if (jsFiles.length > 0) {
    return jsFiles[0];
  }

  // Return first available file
  const fallback = allFiles[0];
  return fallback;
};
