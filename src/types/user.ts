import z from 'zod';

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  username: z.string(),
  social_link: z.array(
    z.object({
      type: z.string(),
      url: z.string(),
    }),
  ),
  created_at: z.string(),
  updated_at: z.string(),
});
export type UserProfileType = z.infer<typeof UserProfileSchema>;

export const UserProfileResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: UserProfileSchema,
  meta: z.null(),
});

export type UserProfileResType = z.infer<typeof UserProfileResSchema>;
