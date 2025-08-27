import { type ClassValue, clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ApiResponse<T> {
  status: 'OK' | 'ERROR' | 'INVALID' | 'NOT_FOUND';
  data: T;
  message: string;
}

export class HttpError<T> extends Error {
  status: 'OK' | 'ERROR' | 'INVALID' | 'NOT_FOUND';
  data: T;
  message: string;

  constructor(apiResponse: ApiResponse<T>) {
    super(apiResponse.message);
    this.status = apiResponse.status;
    this.data = apiResponse.data;
    this.message = apiResponse.message;
    this.name = 'HttpError';
  }

  // Helper methods for common checks
  isError(): boolean {
    return this.status === 'ERROR';
  }

  isNotFound(): boolean {
    return this.status === 'NOT_FOUND';
  }

  isValidationError(): boolean {
    return this.status === 'INVALID';
  }
}

export const handleErrorApi = <T = unknown>({
  error,
  duration,
}: {
  error: HttpError<T> | unknown;
  duration?: number;
}) => {
  if (error instanceof HttpError) {
    // Customize message base on status
    // let title = 'Error';
    // if (error.isValidationError()) {
    //   title = 'Validation Error';
    // } else if (error.isNotFound()) {
    //   title = 'Not Found';
    // }

    toast.error('', {
      description: error.message,
      duration: duration ?? 5000,
    });
  } else {
    toast.error('Something went wrong', {
      description: 'Please try again later',
      duration: duration ?? 5000,
    });
  }
};

export const wrapServerApi = async <T>(fn: () => Promise<T>) => {
  let result = null;
  try {
    result = await fn();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('NEXT_REDIRECT')) {
        throw error;
      }
    }
  }
  return result;
};

// S3 Response Utilities
export const extractS3Contents = (s3Response: any) => {
  if (!s3Response?.ListBucketResult?.Contents) {
    return [];
  }

  // Handle both single item and array cases
  const contents = Array.isArray(s3Response.ListBucketResult.Contents)
    ? s3Response.ListBucketResult.Contents
    : [s3Response.ListBucketResult.Contents];

  return contents.map((item: any) => ({
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

export const extractS3CommonPrefixes = (s3Response: any) => {
  if (!s3Response?.ListBucketResult?.CommonPrefixes) {
    return [];
  }

  const prefixes = Array.isArray(s3Response.ListBucketResult.CommonPrefixes)
    ? s3Response.ListBucketResult.CommonPrefixes
    : [s3Response.ListBucketResult.CommonPrefixes];

  return prefixes.map((prefix: any) => ({
    prefix: prefix.Prefix,
    folderName: prefix.Prefix.split('/').slice(-2, -1)[0] || '',
  }));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
