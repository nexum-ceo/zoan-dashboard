import z from 'zod';

export const GetProviderResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(z.string()),
});

export type GetProviderResType = z.infer<typeof GetProviderResSchema>;

export const GetModelResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(z.string()),
});

export type GetModelResType = z.infer<typeof GetModelResSchema>;

export const CreateProviderBodySchema = z.object({
  api_token: z.string(),
  provider: z.string(),
});

export type CreateProviderBodyType = z.infer<typeof CreateProviderBodySchema>;

export const ProviderOfUserSchema = z.object({
  id: z.string(),
  provider: z.string(),
  api_token: z.string(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProviderOfUserType = z.infer<typeof ProviderOfUserSchema>;
export const CreateProviderResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: ProviderOfUserSchema,
});

export type CreateProviderResType = z.infer<typeof CreateProviderResSchema>;

export const GetProviderOfUserResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(ProviderOfUserSchema),
});

export type GetProviderOfUserResType = z.infer<
  typeof GetProviderOfUserResSchema
>;
