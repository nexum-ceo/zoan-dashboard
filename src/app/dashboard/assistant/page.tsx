'use client';
import AddAgentForm from '@/app/dashboard/assistant/[id]/components/add-agent-form';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/date';
import { handleErrorApi } from '@/lib/utils';
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
        if (data.status === 'success' && Array.isArray(data.data)) {
          setAgents(data.data);
        } else {
          setAgents([]);
          setError('No agents found.');
        }
      } catch (err) {
        handleErrorApi({ error: err });
        setError('Failed to load agents');
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
        {loading ? <Skeleton className="h-8 w-32" /> : 'Assistants'}
      </div>
      <div className="flex-1 flex flex-row gap-6 pt-3">
        {/* Left: Agent List as Card */}
        <div className="w-[400px] min-w-[320px] max-w-[500px] flex flex-col">
          <div className="text-xs text-gray-500 mb-2">
            {loading ? (
              <Skeleton className="h-3 w-20" />
            ) : (
              <>
                Today,{' '}
                {new Date().toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </>
            )}
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[calc(100vh-200px)]">
            {loading ? (
              // Skeleton loading cards
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-border rounded-lg px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-48 mb-2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4 mt-1" />
                </div>
              ))
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
                  className="bg-white border border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 transition flex flex-col gap-1 shadow-sm"
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
        </div>
        {/* Right: Add Agent Form */}
        <div className="flex-1 min-w-[500px]">
          <AddAgentForm />
        </div>
      </div>
    </div>
  );
}
