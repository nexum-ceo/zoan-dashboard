import z from 'zod';

export const GetProviderResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(z.string()),
});

export type GetProviderResType = z.infer<typeof GetProviderResSchema>;

export const CreateProviderBodySchema = z.object({
  api_token: z.string(),
  provider_name: z.string(),
  user_id: z.string().optional(),
});

export type CreateProviderBodyType = z.infer<typeof CreateProviderBodySchema>;
