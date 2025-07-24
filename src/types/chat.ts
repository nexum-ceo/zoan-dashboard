import { z } from 'zod';

export const CreateChatBodySchema = z.object({
  agent_id: z
    .string()
    .min(1, 'Agent ID is required')
    .max(100, 'Agent ID must be less than 100 characters'),
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
    agent_id: z.string(),
    title: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export type CreateChatResType = z.infer<typeof CreateChatResSchema>;

export const GetSpecificChatResSchema = z.object({
  status: z.string(),
  message: z.string(),
  chat: z.object({
    id: z.string(),
    user_id: z.string(),
    agent_id: z.string(),
    title: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export type GetSpecificChatResType = z.infer<typeof GetSpecificChatResSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  chat_id: z.string(),
  role: z.enum(['user', 'assistant']),
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
  chats: z.array(
    z.object({
      id: z.string(),
      user_id: z.string(),
      agent_id: z.string(),
      title: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  ),
});

export type GetChatListResType = z.infer<typeof GetChatListResSchema>;
