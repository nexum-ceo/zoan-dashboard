import z from 'zod';

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.email(),
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

// Per-item validation for social links used during updates only
const SocialLinkUpdateSchema = z
  .object({
    type: z.string(),
    url: z.string(),
  })
  .superRefine((val, ctx) => {
    const type = (val.type || '').toLowerCase();
    const url = val.url || '';
    if (!url) return; // allow empty; presence can be enforced elsewhere if needed

    if (type === 'location') {
      // location isn't a URL; skip URL domain checks
      return;
    }

    let parsed: URL | null = null;
    try {
      parsed = new URL(url);
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Invalid URL format' });
      return;
    }
    const host = parsed.hostname.toLowerCase();
    if (type === 'github' && !host.endsWith('github.com')) {
      ctx.addIssue({
        code: 'custom',
        message: 'URL must be a github.com link',
      });
    }
    if (
      type === 'x' &&
      !(host.endsWith('x.com') || host.endsWith('twitter.com'))
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'URL must be an x.com or twitter.com link',
      });
    }
    // website: any valid URL passes via URL constructor
  });

export const UserProfileUpdateSchema = UserProfileSchema.omit({
  id: true,
  email: true,
  role: true,
  created_at: true,
  updated_at: true,
}).extend({
  social_link: z.array(SocialLinkUpdateSchema),
});
export type UserProfileUpdateType = z.infer<typeof UserProfileUpdateSchema>;
