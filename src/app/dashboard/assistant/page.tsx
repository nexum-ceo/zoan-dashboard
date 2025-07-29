'use client';
import AddAgentForm from '@/app/dashboard/assistant/[id]/components/add-agent-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/date';
import { AgentType, GetAgentResType } from '@/types/agent';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AssistantPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

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
        <Button
          onClick={() => {
            setEditDialogOpen(true);
          }}
        >
          Add Agent
        </Button>
      </div>
      <div className="flex-1 flex flex-row gap-3 pt-3">
        <Table className="w-full h-fit bg-white border border-border rounded-lg">
          <TableCaption>A list of your agents.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No agents found.
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => (
                <TableRow
                  key={agent.id}
                  onClick={() => handleClick(agent.id)}
                  className="cursor-pointer hover:bg-muted transition-colors"
                >
                  <TableCell className="font-medium">{agent.id}</TableCell>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>{agent.description}</TableCell>
                  <TableCell>{formatDate(agent.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {formatDate(agent.updated_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Dialog show Configuration */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent style={{ width: '900px', maxWidth: '85vw' }}>
          <AddAgentForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
