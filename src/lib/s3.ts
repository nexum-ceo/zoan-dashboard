import type { MediaFile, MediaFolder } from '@/app/dashboard/library/lib/data';
import type { S3ContentsType, S3ListBucketResultType } from '@/types/library';

export function getMediaTypeFromFilename(filename: string): MediaFile['type'] {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const image = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];
  const audio = ['mp3', 'wav', 'aac', 'flac', 'ogg'];
  const video = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  const archive = ['zip', 'rar', '7z', 'tar', 'gz'];
  const document = [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'md',
  ];
  if (image.includes(ext)) return 'image';
  if (audio.includes(ext)) return 'audio';
  if (video.includes(ext)) return 'video';
  if (archive.includes(ext)) return 'archive';
  if (document.includes(ext)) return 'document';
  return 'document';
}

export function s3ToMediaFolders(
  s3Response: S3ListBucketResultType,
  expandedFolders: string[],
): MediaFolder[] {
  if (!s3Response?.ListBucketResult?.CommonPrefixes) {
    return [];
  }

  const prefixes = Array.isArray(s3Response.ListBucketResult.CommonPrefixes)
    ? s3Response.ListBucketResult.CommonPrefixes
    : [s3Response.ListBucketResult.CommonPrefixes];

  return prefixes.map((prefix) => {
    const pathParts = prefix.Prefix.split('/').filter(Boolean);
    const folderName = pathParts[pathParts.length - 1] || 'Root';

    return {
      id: prefix.Prefix,
      name: folderName,
      fileCount: 0,
      size: 0,
      color: 'blue',
      parentId: undefined,
      isExpanded: expandedFolders.includes(prefix.Prefix),
    };
  });
}

export function s3ToMediaFiles(
  s3Response: S3ListBucketResultType | undefined,
  currentUserId: string,
): MediaFile[] {
  if (!s3Response?.ListBucketResult?.Contents) {
    return [];
  }

  const contents: S3ContentsType[] = Array.isArray(
    s3Response.ListBucketResult.Contents,
  )
    ? s3Response.ListBucketResult.Contents
    : [s3Response.ListBucketResult.Contents];

  const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || '';

  return contents
    .filter((item) => typeof item.Key === 'string' && !item.Key.endsWith('/'))
    .map((item) => {
      const key = item.Key;
      const parts = key.split('/');
      const fileName = parts[parts.length - 1] || '';
      const folderId =
        parts.length > 1
          ? `${parts.slice(0, parts.length - 1).join('/')}/`
          : `${currentUserId}/`;

      const fileType = getMediaTypeFromFilename(fileName);

      return {
        id: key,
        name: fileName,
        type: fileType,
        size: Number(item.Size) || 0,
        uploadDate: new Date(item.LastModified || Date.now()),
        folder: folderId,
        url: `${baseUrl}/library/${key}`,
        thumbnail:
          fileType === 'image' ? `${baseUrl}/library/${key}` : undefined,
      } as MediaFile;
    });
}

export function putZeroByte(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`PUT failed with status: ${xhr.status}`));
      }
    });
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during PUT'));
    });
    xhr.open('PUT', url);
    xhr.send(new Blob());
  });
}

// S3 Response Utilities
export const extractS3Contents = (s3Response: S3ListBucketResultType) => {
  if (!s3Response?.ListBucketResult?.Contents) {
    return [];
  }

  // Handle both single item and array cases
  const contents = Array.isArray(s3Response.ListBucketResult.Contents)
    ? s3Response.ListBucketResult.Contents
    : [s3Response.ListBucketResult.Contents];

  return contents.map((item: S3ContentsType) => ({
    key: item.Key,
    lastModified: item.LastModified,
    etag: item.ETag,
    size: item.Size,
    owner: item.Owner,
    storageClass: item.StorageClass,
    // Extract filename from key
    fileName: item.Key.split('/').pop() || '',
    // Extract folder path
    folderPath: item.Key.split('/').slice(0, -1).join('/'),
  }));
};

export const extractS3CommonPrefixes = (s3Response: S3ListBucketResultType) => {
  if (!s3Response?.ListBucketResult?.CommonPrefixes) {
    return [];
  }

  const prefixes = Array.isArray(s3Response.ListBucketResult.CommonPrefixes)
    ? s3Response.ListBucketResult.CommonPrefixes
    : [s3Response.ListBucketResult.CommonPrefixes];

  return prefixes.map((prefix) => ({
    prefix: prefix.Prefix,
    folderName: prefix.Prefix.split('/').slice(-2, -1)[0] || '',
  }));
};
