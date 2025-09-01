import axiosInstance from '@/lib/axios-instance';
import {
  PresignedUrlBodyType,
  PresignedUrlResponseType,
} from '@/types/library';
import { XMLParser } from 'fast-xml-parser';

// XML Parser configuration for S3 responses
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  parseTagValue: true,
});

// Helper function to parse XML response to JSON
const parseXmlResponse = (xmlString: string) => {
  try {
    return xmlParser.parse(xmlString);
  } catch (error) {
    console.error('Error parsing XML:', error);
    throw new Error('Failed to parse XML response');
  }
};

const libraryApiRequest = {
  getPresignedUrls: (body: PresignedUrlBodyType) =>
    axiosInstance.post<PresignedUrlResponseType>(
      '/library/presigned-url',
      body,
    ),

  getListFileOfUser: async (userId: string) => {
    const response = await axiosInstance.get(
      `/library/?prefix=${userId}/&delimiter=/`,
      {
        baseURL: process.env.NEXT_PUBLIC_MINIO_URL,
        responseType: 'text',
      },
    );
    return parseXmlResponse(response.data);
  },

  getListFolder: async (userId: string) => {
    const response = await axiosInstance.get(
      `/library/?prefix=${userId}/&delimiter=/`,
      {
        baseURL: process.env.NEXT_PUBLIC_MINIO_URL,
        responseType: 'text',
      },
    );
    return parseXmlResponse(response.data);
  },

  getListFileInFolder: async (userId: string, folderPath: string) => {
    const response = await axiosInstance.get(
      `/library/?prefix=${userId}/${folderPath}&delimiter=/`,
      {
        baseURL: process.env.NEXT_PUBLIC_MINIO_URL,
        responseType: 'text',
      },
    );
    return parseXmlResponse(response.data);
  },

  deleteFile: async (path: string) =>
    axiosInstance.delete('/library/file', {
      data: {
        path,
      },
    }),

  //Call through Next.js server
  sGetPresignedUrls: (body: PresignedUrlBodyType) =>
    axiosInstance.post<PresignedUrlResponseType>(
      '/library/presigned-url',
      body,
      {
        baseURL: '',
      },
    ),

  sGetListFileOfUser: async (userId: string) => {
    const response = await axiosInstance.get(
      `/library/list-files?userId=${userId}&folderPath=all`,
      {
        baseURL: '',
      },
    );
    // Response from wrapper is { data: xmlString }
    return parseXmlResponse(response.data);
  },

  sGetListFolder: async (userId: string) => {
    const response = await axiosInstance.get(
      `/library/list-folder?userId=${userId}`,
      {
        baseURL: '',
      },
    );
    // Response from wrapper is { data: xmlString }
    return parseXmlResponse(response.data);
  },

  sGetListFileInFolder: async (userId: string, folderPath: string) => {
    const response = await axiosInstance.get(
      `/library/list-files?userId=${userId}&folderPath=${folderPath}`,
      {
        baseURL: '',
      },
    );
    // Response from wrapper is { data: xmlString }
    return parseXmlResponse(response.data);
  },

  sDeleteFile: async (path: string) =>
    axiosInstance.delete('/library/file', {
      data: {
        path,
      },
      baseURL: '',
    }),

  getPublicAssets: async (folderPath: string = '') => {
    const response = await axiosInstance.get(
      `/library/?prefix=assets/${folderPath}&delimiter=/`,
      {
        baseURL: process.env.NEXT_PUBLIC_MINIO_URL,
        responseType: 'text',
      },
    );
    return parseXmlResponse(response.data);
  },

  sGetPublicAssets: async (folderPath: string = '') => {
    const response = await axiosInstance.get(
      `/library/public-assets?folderPath=${folderPath}`,
      {
        baseURL: '',
      },
    );
    return parseXmlResponse(response.data);
  },
};

export default libraryApiRequest;
