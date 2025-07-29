import z from 'zod';

export const TokenPayloadSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  exp: z.number(),
  iat: z.number(),
});
export type TokenPayloadType = z.infer<typeof TokenPayloadSchema>;
