import { SYSTEM_MESSAGES } from '@/const/system-message';
import { NextResponse } from 'next/server';

export interface ApiWrapperOptions {
  onError?: (error: unknown) => { error: string; status: number };
  defaultErrorMessage?: string;
}

export interface ApiWrapperResult<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Simple wrapper for Next.js server API routes
 * Only use when response is guaranteed from backend
 * @param operation - Function to perform API call
 * @param options - Custom options
 * @returns NextResponse with data or error
 */
export async function apiWrapper<T = unknown>(
  operation: () => Promise<{ data: T }>,
  options: ApiWrapperOptions = {},
): Promise<NextResponse> {
  const { onError, defaultErrorMessage = SYSTEM_MESSAGES.INTERNAL_ERROR } =
    options;

  try {
    const result = await operation();
    // Backend response always has format { data: ... }
    return NextResponse.json(result.data);
  } catch (error) {
    let message = defaultErrorMessage;
    let status = 500;

    // If there is onError callback, use it
    if (onError) {
      const errorResult = onError(error);
      return NextResponse.json(
        { error: errorResult.error },
        { status: errorResult.status },
      );
    }

    // Handle default error
    if (error instanceof Error) {
      message = error.message;
    }

    // Handle special status codes from backend
    if (message === 'Request failed with status code 401') {
      status = 401;
      message = SYSTEM_MESSAGES.UNAUTHORIZED_ERROR;
    } else if (message === 'Request failed with status code 403') {
      status = 403;
      message = SYSTEM_MESSAGES.FORBIDDEN_ERROR;
    } else if (message === 'Request failed with status code 404') {
      status = 404;
      message = SYSTEM_MESSAGES.NOT_FOUND_ERROR;
    } else if (message === 'Request failed with status code 422') {
      status = 422;
      message = SYSTEM_MESSAGES.VALIDATION_ERROR;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
