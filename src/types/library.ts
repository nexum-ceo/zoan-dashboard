import { z } from 'zod';

export const PresignedUrlBodySchema = z.object({
  file_list: z.array(
    z.object({
      path: z.string(),
      file_name: z.string(),
    }),
  ),
});

export type PresignedUrlBodyType = z.infer<typeof PresignedUrlBodySchema>;

export const PresignedUrlItemSchema = z.object({
  presigned_url: z.string(),
  file_name: z.string(),
});

export type PresignedUrlItemType = z.infer<typeof PresignedUrlItemSchema>;

export const PresignedUrlResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(PresignedUrlItemSchema),
  meta: z.array(z.null()).optional(),
});

export type PresignedUrlResponseType = z.infer<
  typeof PresignedUrlResponseSchema
>;
