import { z } from 'zod';

export type WorkflowNode = {
  id: string;
  name: string;
  position?: { x: number; y: number };
  type?: string;
  workflow_id?: string;
  config?: Record<string, string>;
};

export type WorkflowConnection = {
  id: string;
  from_node_id: string;
  to_node_id: string;
  type?: string;
  condition?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
};

export type TabType = 'Setting' | 'Introduction';

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  publish_version: z.string().optional(),
  trigger_condition: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type WorkflowType = z.infer<typeof WorkflowSchema>;

export const CreateWorkflowSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type CreateWorkflowType = z.infer<typeof CreateWorkflowSchema>;
