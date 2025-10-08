import z from 'zod';
import { AgentSchema, AgentType } from './agent';
import { PaginationMetaSchema } from './common';

export const CommunityAgentSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  is_free: z.boolean(),
  price: z.number(),
  rating_avg: z.number(),
  rating_count: z.number(),
  install_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TCommunityAgent = z.infer<typeof CommunityAgentSchema>;

export type TAgentWithInstallStatus = AgentType & {
  is_installed: boolean;
};
export const CommunityAgentDataSchema = z.object({
  community: CommunityAgentSchema,
  agent: AgentSchema.extend({
    is_installed: z.boolean(),
    is_owner: z.boolean(),
  }),
});

export type TCommunityAgentData = z.infer<typeof CommunityAgentDataSchema>;

export const CommunityAgentResSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(CommunityAgentDataSchema),
  meta: PaginationMetaSchema,
});

export type TCommunityAgentRes = z.infer<typeof CommunityAgentResSchema>;
