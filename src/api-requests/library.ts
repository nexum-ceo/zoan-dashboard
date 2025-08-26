import axiosInstance from '@/lib/axios-instance';
import {
  PresignedUrlBodyType,
  PresignedUrlResponseType,
} from '@/types/library';

const libraryApiRequest = {
  getPresignedUrls: (body: PresignedUrlBodyType) =>
    axiosInstance.post<PresignedUrlResponseType>(
      '/library/presigned-url',
      body,
    ),
  sGetPresignedUrls: (body: PresignedUrlBodyType) =>
    axiosInstance.post<PresignedUrlResponseType>(
      '/library/presigned-url',
      body,
      {
        baseURL: '',
      },
    ),
};

export default libraryApiRequest;
