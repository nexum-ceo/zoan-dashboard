import { ResponseFormatSchema } from '@/types/agent';
import { z } from 'zod';

export const CreateChatBodySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
});

export type CreateChatBodyType = z.infer<typeof CreateChatBodySchema>;

export const CreateChatResSchema = z.object({
  chat: z.object({
    id: z.string(),
    user_id: z.string(),
    title: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export type CreateChatResType = z.infer<typeof CreateChatResSchema>;

export const GetSpecificChatResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    user_id: z.string(),
    title: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export type GetSpecificChatResType = z.infer<typeof GetSpecificChatResSchema>;

export enum ChatRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  DATA = 'data',
}

export const ChatMessageSchema = z.object({
  id: z.string(),
  chat_id: z.string(),
  role: z.enum(ChatRole),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ChatMessageType = z.infer<typeof ChatMessageSchema>;

export const GetChatMessagesResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(ChatMessageSchema),
});

export type GetChatMessagesResType = z.infer<typeof GetChatMessagesResSchema>;

export const GetChatListResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(
    z.object({
      id: z.string(),
      user_id: z.string(),
      title: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  ),
});

export type GetChatListResType = z.infer<typeof GetChatListResSchema>;

export const GetPrimaryAgentByChatIdResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    user_id: z.string(),
    name: z.string(),
    description: z.string(),
    prompt: z.string(),
    model: z.string(),
    response_format: ResponseFormatSchema,
    model_kwargs: z.object({
      temperature: z.number(),
      top_p: z.number(),
      max_tokens: z.number(),
    }),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export type GetPrimaryAgentByChatIdResType = z.infer<
  typeof GetPrimaryAgentByChatIdResSchema
>;

export const GetChatAgentSettingByChatIdResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(
    z.object({
      id: z.string(),
      chat_id: z.string(),
      agent_id: z.string(),
      is_primary: z.boolean(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  ),
});

export type GetChatAgentSettingByChatIdResType = z.infer<
  typeof GetChatAgentSettingByChatIdResSchema
>;

export const CreateChatAgentSettingBodySchema = z.object({
  agent_id_list: z.array(z.string()),
});

export type CreateChatAgentSettingBodyType = z.infer<
  typeof CreateChatAgentSettingBodySchema
>;

export const CreateChatAgentSettingResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.number(),
});

export type CreateChatAgentSettingResType = z.infer<
  typeof CreateChatAgentSettingResSchema
>;
