'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

interface AgentContextType {
  selectedAgentId: string | undefined;
  setSelectedAgentId: (agentId: string | undefined) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(
    undefined,
  );

  return (
    <AgentContext.Provider value={{ selectedAgentId, setSelectedAgentId }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}
