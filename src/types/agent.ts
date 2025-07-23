import { z } from 'zod';

export const AgentSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
  model: z.string(),
  response_format: z.string(),
  temperature: z.number(),
  top_p: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetAgentResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(AgentSchema),
});

export type AgentItemType = z.infer<typeof AgentSchema>;
export type GetAgentResType = z.infer<typeof GetAgentResSchema>;

export const CreateAgentBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
  model: z.string(),
  response_format: z.string(),
  temperature: z.number(),
  top_p: z.number(),
});

export type CreateAgentBodyType = z.infer<typeof CreateAgentBodySchema>;

export const CreateAgentResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: AgentSchema,
});

export type CreateAgentResType = z.infer<typeof CreateAgentResSchema>;
