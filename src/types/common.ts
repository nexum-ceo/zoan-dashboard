import { z } from 'zod';

export const PaginationMetaSchema = z.object({
  offset: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().positive(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export type PaginatedResponse<T> = {
  status: string;
  message: string;
  data: T[];
  meta: PaginationMeta;
};
