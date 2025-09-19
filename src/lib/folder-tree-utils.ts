import type { S3ListBucketResultType } from '@/types/library';
import { extractS3CommonPrefixes, extractS3Contents } from './s3';

export type TreeNode = {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
};

export const buildFolderTree = (
  s3Data: S3ListBucketResultType | undefined,
  chatId: string,
  version: string,
  folderContents: Record<string, S3ListBucketResultType>,
): TreeNode | null => {
  if (!s3Data) return null;

  const contents = extractS3Contents(s3Data);
  const folders = extractS3CommonPrefixes(s3Data);

  if (!contents.length && !folders.length) {
    return { name: '/', path: '/', type: 'folder', children: [] };
  }

  const prefix = `${chatId}/${version}/`;
  const root: TreeNode = {
    name: '/',
    path: '/',
    type: 'folder',
    children: [],
  };

  const ensureFolder = (parent: TreeNode, folderName: string): TreeNode => {
    parent.children = parent.children || [];
    const existing = parent.children.find(
      (c) => c.type === 'folder' && c.name === folderName,
    );
    if (existing) return existing;
    const node: TreeNode = {
      name: folderName,
      path:
        parent.path === '/' ? `/${folderName}` : `${parent.path}/${folderName}`,
      type: 'folder',
      children: [],
    };
    parent.children.push(node);
    return node;
  };

  const addFile = (parent: TreeNode, fileName: string, fullPath: string) => {
    parent.children = parent.children || [];
    parent.children.push({ name: fileName, path: fullPath, type: 'file' });
  };

  // Add folders first
  folders.forEach((folder) => {
    const folderName = folder.folderName;
    ensureFolder(root, folderName);
  });

  // Add files in current directory
  contents
    .filter((item) => typeof item.key === 'string' && !item.key.endsWith('/'))
    .forEach((item) => {
      const rel = item.key.startsWith(prefix)
        ? item.key.slice(prefix.length)
        : item.key;
      const parts = rel.split('/').filter(Boolean);
      let cursor = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        if (isLast) {
          const fullPath = `/${rel}`;
          addFile(cursor, part, fullPath);
        } else {
          cursor = ensureFolder(cursor, part);
        }
      }
    });

  // Add files from subfolders if we have their content
  Object.entries(folderContents).forEach(([folderName, folderData]) => {
    if (folderData) {
      const folderFiles = extractS3Contents(folderData);
      const folderNode = root.children?.find(
        (child) => child.type === 'folder' && child.name === folderName,
      );

      if (folderNode) {
        folderFiles
          .filter(
            (item) => typeof item.key === 'string' && !item.key.endsWith('/'),
          )
          .forEach((item) => {
            const rel = item.key.startsWith(`${prefix}${folderName}/`)
              ? item.key.slice(`${prefix}${folderName}/`.length)
              : item.key;
            const fullPath = `/${folderName}/${rel}`;
            addFile(folderNode, rel, fullPath);
          });
      }
    }
  });

  return root;
};
