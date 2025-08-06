import { z } from 'zod';

// Response format schemas
const ResponseFormatText = z.object({
  type: z.literal('text'),
});
const ResponseFormatJsonObject = z.object({
  type: z.literal('json_object'),
});

// TODO: for future fix, currently uses `z.any()` for simplicity
const ResponseFormatJsonSchema = z.object({
  type: z.literal('json_schema'),
  json_schema: z.record(z.string(), z.any()),
});
export const ResponseFormatSchema = z.discriminatedUnion('type', [
  ResponseFormatText,
  ResponseFormatJsonObject,
  ResponseFormatJsonSchema,
]);

export const AgentSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
  model_kwargs: z.object({
    max_tokens: z.number(),
    temperature: z.number(),
    top_p: z.number(),
  }),
  model: z.string(),
  response_format: ResponseFormatSchema,
  provider_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetAgentResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(AgentSchema),
});

export type AgentType = z.infer<typeof AgentSchema>;
export type GetAgentResType = z.infer<typeof GetAgentResSchema>;

export const GetSpecificAgentResSchema = AgentSchema;

export type GetSpecificAgentResType = z.infer<typeof GetSpecificAgentResSchema>;

export const CreateAgentBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  prompt: z.string().min(1, 'System instruction is required'),
  max_tokens: z
    .number()
    .min(5, 'Max token must be at least 5')
    .max(8192, 'Max token must be at most 8192')
    .optional(),
  provider_id: z.string().min(1, 'Provider is required'),
  model: z.string().min(1, 'Model is required'),
  response_format: ResponseFormatSchema,
  temperature: z
    .number()
    .min(0, 'Temperature must be at least 0')
    .max(2, 'Temperature must be at most 2'),
  top_p: z
    .number()
    .min(0, 'Top P must be at least 0')
    .max(1, 'Top P must be at most 1'),
});

export type CreateAgentBodyType = z.infer<typeof CreateAgentBodySchema>;

export const CreateAgentResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: AgentSchema,
});

export type CreateAgentResType = z.infer<typeof CreateAgentResSchema>;

export const UpdateAgentBodySchema = AgentSchema;

export type UpdateAgentBodyType = z.infer<typeof UpdateAgentBodySchema>;
