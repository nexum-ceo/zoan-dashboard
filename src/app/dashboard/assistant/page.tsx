'use client';
import AddAgentForm from '@/app/dashboard/assistant/[id]/components/add-agent-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAgentList } from '@/hooks/data/agent';
import { formatDate } from '@/lib/date';
import { useRouter } from 'next/navigation';

export default function AssistantPage() {
  const router = useRouter();
  const { data: agentData, isLoading: loading, error } = useGetAgentList();
  const agents = agentData?.data.data || [];

  const handleClick = (agentId: string) => {
    router.push(`/dashboard/assistant/${agentId}`);
  };

  return (
    <div className="w-full h-full bg-background flex flex-col p-4">
      <div className="p-4 flex justify-between text-2xl font-semibold border-b border-border bg-card text-card-foreground rounded-t-lg w-full">
        {loading ? <Skeleton className="h-8 w-32" /> : 'Assistants'}
      </div>
      <div className="flex-1 flex flex-row gap-6 pt-3">
        {/* Left: Agent List as Card */}
        <div className="w-[400px] min-w-[320px] max-w-[500px] flex flex-col">
          <div className="text-xs text-muted-foreground mb-2">
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
                  className="bg-card text-card-foreground border border-border rounded-lg px-4 py-3 shadow-sm"
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
              <div className="text-center text-red-500 py-8">
                {error instanceof Error
                  ? error.message
                  : 'Failed to load agents'}
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No agents found.
              </div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => handleClick(agent.id)}
                  className="bg-card text-card-foreground border border-border rounded-lg px-4 py-3 cursor-pointer transition flex flex-col gap-1 shadow-sm hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-base truncate max-w-[220px]">
                      {agent.name || 'Untitled assistant'}
                    </div>
                    <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {formatDate(agent.created_at)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[260px]">
                    {agent.id}
                  </div>
                  {agent.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
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
