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
  if (error instanceof Error) {
    toast.error('Error', {
      description: error?.payload?.message ?? 'Lỗi không xác định',
      duration: duration ?? 5000,
    });
  } else {
  }
};
