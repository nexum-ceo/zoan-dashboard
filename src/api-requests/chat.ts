import axiosInstance from '@/lib/axios-instance';
import {
  CreateChatAgentSettingBodyType,
  CreateChatAgentSettingResType,
  CreateChatBodyType,
  CreateChatResType,
  GetChatAgentSettingByChatIdResType,
  GetChatListResType,
  GetChatMessagesResType,
  GetPrimaryAgentByChatIdResType,
  GetSpecificChatResType,
} from '@/types/chat';

const chatApiRequest = {
  list: (pageParams: { offset?: number; limit?: number }) =>
    axiosInstance.get<GetChatListResType>('/chat', {
      params: {
        offset: pageParams.offset?.toString(),
        limit: pageParams.limit?.toString(),
      },
    }),
  sList: () =>
    axiosInstance.get<GetChatListResType>('/chat', {
      baseURL: '',
    }),
  sListInfinite: (pageParams: { offset?: number; limit?: number }) =>
    axiosInstance.get<GetChatListResType>('/chat', {
      baseURL: '',
      params: {
        offset: pageParams.offset?.toString(),
        limit: pageParams.limit?.toString(),
      },
    }),
  add: (body: CreateChatBodyType) =>
    axiosInstance.post<CreateChatResType>('/chat', body),
  sAdd: (body: CreateChatBodyType) =>
    axiosInstance.post<CreateChatResType>('/chat', body, {
      baseURL: '',
    }),
  getChat: (id: string) =>
    axiosInstance.get<GetSpecificChatResType>(`/chat/${id}`),
  sGetChat: (id: string) =>
    axiosInstance.get<GetSpecificChatResType>(`/chat/${id}`, {
      baseURL: '',
    }),
  getChatMessages: (
    id: string,
    pageParams: { offset?: number; limit?: number },
  ) =>
    axiosInstance.get<GetChatMessagesResType>(`/chat/${id}/messages`, {
      params: {
        offset: pageParams.offset?.toString(),
        limit: pageParams.limit?.toString(),
      },
    }),
  sGetChatMessages: (
    id: string,
    pageParams: { offset?: number; limit?: number },
  ) =>
    axiosInstance.get<GetChatMessagesResType>(`/chat-message/${id}`, {
      baseURL: '',
      params: {
        offset: pageParams.offset?.toString(),
        limit: pageParams.limit?.toString(),
      },
    }),
  getPrimaryAgentByChatId: (id: string) =>
    axiosInstance.get<GetPrimaryAgentByChatIdResType>(
      `/chat/${id}/primary-agent`,
    ),
  sGetPrimaryAgentByChatId: (id: string) =>
    axiosInstance.get<GetPrimaryAgentByChatIdResType>(
      `/chat/${id}/primary-agent`,
      {
        baseURL: '',
      },
    ),
  getChatAgentSettingByChatId: (id: string) =>
    axiosInstance.get<GetChatAgentSettingByChatIdResType>(
      `/chat/${id}/agent-setting`,
    ),
  sGetChatAgentSettingByChatId: (id: string) =>
    axiosInstance.get<GetChatAgentSettingByChatIdResType>(
      `/chat/${id}/agent-setting`,
      {
        baseURL: '',
      },
    ),
  createChatAgentSetting: (id: string, body: CreateChatAgentSettingBodyType) =>
    axiosInstance.post<CreateChatAgentSettingResType>(
      `/chat/${id}/agent-setting`,
      body,
    ),
  sCreateChatAgentSetting: (id: string, body: CreateChatAgentSettingBodyType) =>
    axiosInstance.post<CreateChatAgentSettingResType>(
      `/chat/${id}/agent-setting`,
      body,
      {
        baseURL: '',
      },
    ),
};

export default chatApiRequest;
