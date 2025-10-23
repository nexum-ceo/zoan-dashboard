export const AGENT_KEYS = {
  agents: ['agents'] as const,
  agentAvailable: ['agent-available'] as const,
  agentInstalled: ['agent-installed'] as const,
  agent: (id: string) => ['agent', id] as const,
} as const;
