// Agent Query Keys
export const AGENT_KEYS = {
  // List queries
  agents: ['agents'] as const,
  agentAvailable: ['agent-available'] as const,
  agentInstalled: ['agent-installed'] as const,

  // Single agent queries
  agent: (id: string) => ['agent', id] as const,
} as const;
