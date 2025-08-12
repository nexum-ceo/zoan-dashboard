// "use server";
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import { HttpError, type ApiResponse } from './utils';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for authentication
axiosInstance.interceptors.request.use(
  async (config) => {
    let token: string | undefined;

    const isServer = typeof window === 'undefined';

    if (isServer) {
      const session = await getServerSession(authOptions);
      token = session?.accessToken;
    } else {
      token = localStorage.getItem('access_token') || undefined;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.baseURL || config.baseURL === '') {
      config.baseURL =
        process.env.NEXT_PUBLIC_NEXT_SERVER_URL || 'http://localhost:3000/api';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      const isServer = typeof window === 'undefined';

      // If unauthenticated, sign out for client-side
      if (!isServer) {
        signOut({
          callbackUrl: '/login',
        });
      }
    }

    // If response has data in ApiResponse format, throw HttpError
    if (error.response?.data) {
      const apiResponse = error.response.data as ApiResponse<unknown>;

      // Check if it's a valid ApiResponse format
      if (apiResponse.status && apiResponse.message !== undefined) {
        throw new HttpError(apiResponse);
      }
    }

    // For other errors (network, timeout, etc.), create a generic HttpError
    const genericError: ApiResponse<null> = {
      status: 'ERROR',
      data: null,
      message: error.message || 'An unexpected error occurred',
    };

    throw new HttpError(genericError);
  },
);

export default axiosInstance;
