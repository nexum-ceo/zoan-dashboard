import z from 'zod';

export const GetProviderResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(z.string()),
});

export type GetProviderResType = z.infer<typeof GetProviderResSchema>;
