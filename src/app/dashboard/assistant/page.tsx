'use client';
import AddAgentForm from '@/app/dashboard/assistant/[id]/components/add-agent-form';
// ...existing code...
// ...existing code...
import { formatDate } from '@/lib/date';
import { AgentType, GetAgentResType } from '@/types/agent';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AssistantPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agent');
        const data: GetAgentResType = await res.json();
        if (data.status === 'success' && data.data !== null) {
          setAgents(data.data);
        } else {
          setAgents([]);
          setError('No agents found.');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Fetch failed');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const handleClick = (agentId: string) => {
    router.push(`/dashboard/assistant/${agentId}`);
  };

  return (
    <div className="w-full h-full bg-sidebar flex flex-col p-4">
      <div className="p-4 flex justify-between text-2xl font-semibold border-b border-border bg-white rounded-t-lg w-full">
        Assistants
      </div>
      <div className="flex-1 flex flex-row gap-6 pt-3">
        {/* Left: Agent List as Card */}
        <div className="w-[400px] min-w-[320px] max-w-[500px] flex flex-col gap-2">
          <div className="text-xs text-gray-500 mb-2">
            Today,{' '}
            {new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : agents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No agents found.
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => handleClick(agent.id)}
                className="bg-white border border-border rounded-lg px-4 py-3 mb-1 cursor-pointer hover:bg-gray-50 transition flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-base text-gray-800 truncate max-w-[220px]">
                    {agent.name || 'Untitled assistant'}
                  </div>
                  <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                    {formatDate(agent.created_at)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[260px]">
                  {agent.id}
                </div>
                {agent.description && (
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {agent.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {/* Right: Add Agent Form, wider */}
        <div className="flex-1 min-w-[500px]">
          <AddAgentForm />
        </div>
      </div>
    </div>
  );
}
