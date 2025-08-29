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

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Base64URL helpers for compact, URL-safe encoding/decoding
export const encodeBase64Url = (input: string): string => {
  try {
    // Prefer browser btoa when available
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const b64 =
      typeof window !== 'undefined' && window.btoa
        ? window.btoa(unescape(encodeURIComponent(input)))
        : // Fallback: Node.js Buffer (in case used server-side accidentally)
        typeof Buffer !== 'undefined'
        ? Buffer.from(input, 'utf-8').toString('base64')
        : '';
    return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  } catch {
    return '';
  }
};

export const decodeBase64Url = (input: string): string => {
  try {
    const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const full = b64 + pad;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof window !== 'undefined' && window.atob) {
      return decodeURIComponent(escape(window.atob(full)));
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(full, 'base64').toString('utf-8');
    }
    return '';
  } catch {
    return '';
  }
};

/**
 * Build breadcrumb path from absolute selected prefix and a root prefix.
 * Example: selected = "assets/ui/icons/", root = "assets/" =>
 * returns [
 *   { id: "assets/ui/", name: "ui" },
 *   { id: "assets/ui/icons/", name: "icons" }
 * ]
 */
export const buildBreadcrumbCrumbs = (
  selectedFolder: string | undefined,
  rootPrefix: string | undefined,
): Array<{ id: string; name: string }> => {
  if (!rootPrefix) return [];
  if (!selectedFolder || !selectedFolder.startsWith(rootPrefix)) return [];
  const relative = selectedFolder.slice(rootPrefix.length);
  const parts = relative.split('/').filter(Boolean);
  const crumbs: Array<{ id: string; name: string }> = [];
  let accum = rootPrefix;
  for (const part of parts) {
    accum = accum.endsWith('/') ? accum + part + '/' : accum + '/' + part + '/';
    crumbs.push({ id: accum, name: part });
  }
  return crumbs;
};
