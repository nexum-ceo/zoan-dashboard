// "use server";
import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const isServer = typeof window === 'undefined';

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
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('auth-token');
      token = authCookie?.value;
    } else {
      token = localStorage.getItem('access_token') || undefined;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      // console.log("401");
      // Attempt to refresh token
      redirect('/');
      //   try {
      //     const resData = await axiosInstance.post('/auth/refresh-token');

      //     // Retry original request with new token
      //     error.config.headers.Authorization = `Bearer ${resData.data.access_token}`;
      //   } catch (refreshError) {
      //     // Refresh failed, logout user
      //   }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
