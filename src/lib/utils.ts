import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export class HttpError extends Error {
  status: string;
  data: {
    message: string;
    [key: string]: any;
  };
  constructor({ status, data }: { status: string; data: any }) {
    super('Http Error');
    this.status = status;
    this.data = data;
  }
}

export const handleErrorApi = ({
  error,
  duration,
}: {
  error: unknown;
  duration?: number;
}) => {
  if (error instanceof HttpError) {
    toast.error('Error', {
      description: error?.message ?? 'Unknown error',
      duration: duration ?? 5000,
    });
  } else {
  }
};
