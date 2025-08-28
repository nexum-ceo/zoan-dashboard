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
  file_name: z.string().min(0), // file name is empty <=> create folder
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

// S3 XML Response Types (parsed to JSON)
export const S3OwnerSchema = z.object({
  ID: z.string(),
  DisplayName: z.string(),
});

export const S3ContentsSchema = z.object({
  Key: z.string(),
  LastModified: z.string(),
  ETag: z.string(),
  Size: z.number(),
  Owner: S3OwnerSchema,
  StorageClass: z.string(),
});

export const S3ListBucketResultSchema = z.object({
  ListBucketResult: z.object({
    '@_xmlns': z.string(),
    Name: z.string(),
    Prefix: z.string(),
    Marker: z.string().optional(),
    MaxKeys: z.number(),
    IsTruncated: z.boolean(),
    Contents: z.array(S3ContentsSchema).optional(),
    CommonPrefixes: z
      .array(
        z.object({
          Prefix: z.string(),
        }),
      )
      .optional(),
  }),
});

export type S3ListBucketResultType = z.infer<typeof S3ListBucketResultSchema>;
export type S3ContentsType = z.infer<typeof S3ContentsSchema>;
export type S3OwnerType = z.infer<typeof S3OwnerSchema>;
