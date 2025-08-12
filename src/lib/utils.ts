import { clsx, type ClassValue } from 'clsx';
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
    let title = 'Error';
    if (error.isValidationError()) {
      title = 'Validation Error';
    } else if (error.isNotFound()) {
      title = 'Not Found';
    }

    toast.error(title, {
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
