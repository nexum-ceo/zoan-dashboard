'use client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AGENT_LIST } from '@/const/agent';
import { useRouter } from 'next/navigation';

export default function AssistantPage() {
  const router = useRouter();

  const handleClick = (agentId: string) => {
    router.push(`/dashboard/assistant/${agentId}`); // ✅ works like a Link but programmatically
  };
  return (
    <div className="w-full h-full bg-sidebar rounded-lg border border-border flex flex-col">
      <div className="p-4 text-2xl font-semibold border-b border-border bg-white rounded-t-lg w-full">
        Assistants
      </div>

      <div className="m-2 flex-1 flex flex-row gap-3 p-2">
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
            {AGENT_LIST.map((agent) => (
              <TableRow
                key={agent.name}
                onClick={() => handleClick(agent.id)}
                className="cursor-pointer hover:bg-muted transition-colors"
              >
                <TableCell className="font-medium">{agent.id}</TableCell>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>{agent.description}</TableCell>
                <TableCell>{agent.createdAt}</TableCell>
                <TableCell className="text-right">{agent.updatedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
