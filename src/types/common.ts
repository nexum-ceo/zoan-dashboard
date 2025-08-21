import { z } from 'zod';

export const PaginationMetaSchema = z.object({
  offset: z.number(),
  limit: z.number(),
  total: z.number(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export type PaginatedResponse<T> = {
  status: string;
  message: string;
  data: T[];
  meta: PaginationMeta;
};
