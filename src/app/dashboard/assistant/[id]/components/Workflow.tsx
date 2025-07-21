'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, Edit, FileDown, List, Plus, Trash, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const Flow = dynamic(() => import('./Flow'), { ssr: false });

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Workflow() {
  const [showFlow, setShowFlow] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);
    fetch('/api/workflow')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWorkflows(data);
        else if (Array.isArray(data.data)) setWorkflows(data.data);
        else setWorkflows([]);
        setError(null);
      })
      .catch((err) => {
        setError('Error when fetching workflow');
        setWorkflows([
          {
            id: 'fake-1',
            name: 'Fake Workflow 1',
            publishVersion: '1.0.0',
            triggerCondition: 'On Start',
            status: 'Published',
            updatedAt: '2025-07-21',
          },
          {
            id: 'fake-2',
            name: 'Fake Workflow 2',
            publishVersion: '2.0.0',
            triggerCondition: 'On Event',
            status: 'Draft',
            updatedAt: '2025-07-20',
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFlowClick = (workflow: any) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('flow_id', workflow.id);
    router.replace(`${pathname}?${params.toString()}`);
    setShowFlow(true);
  };

  const handleCloseFlow = () => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('flow_id');
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl);
    setShowFlow(false);
  };

  // Call API create new workflow
  const handleAddWorkflow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/workflow', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          description: newDesc,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWorkflows((prev) => [data, ...prev]);
        setShowFlow(true);
        setOpenDialog(false);
        setNewName('');
        setNewDesc('');
        toast.success('Create workflow successfully!', {
          position: 'top-center',
        });
      } else {
        setError(data?.error || 'Failed to create workflow');
        toast.error(data?.error || 'Failed to create workflow');
      }
    } catch (err) {
      setError('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2 justify-between items-center">
          <div className="text-lg font-medium flex flex-row gap-2 items-center">
            <List />
            Flow list
          </div>
          <div className="text-sm text-muted-foreground flex flex-row gap-2">
            <Button variant="outline">
              <Download /> Import FAQs
            </Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus /> Add New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form
                  onSubmit={handleAddWorkflow}
                  className="flex flex-col gap-4"
                >
                  <DialogHeader>
                    <DialogTitle>Create New Workflow</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      className="border rounded px-3 py-2"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      placeholder="Enter workflow name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="border rounded px-3 py-2"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      required
                      placeholder="Enter description"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create'}
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="text-center py-8">Loading workflow...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Publish Version</TableHead>
                  <TableHead>Trigger Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No workflows found
                    </TableCell>
                  </TableRow>
                ) : (
                  workflows.map((wf, idx) => (
                    <TableRow
                      key={wf.id || idx}
                      onClick={() => handleFlowClick(wf)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell className="hover:bg-gray-100">
                        {wf.name || 'No name'}
                      </TableCell>
                      <TableCell>{wf.publishVersion || '-'}</TableCell>
                      <TableCell>{wf.triggerCondition || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-600 dark:bg-green-600"
                        >
                          {wf.status || 'Published'}
                        </Badge>
                      </TableCell>
                      <TableCell>{wf.updatedAt || '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost">
                          <FileDown />
                        </Button>
                        <Button variant="ghost">
                          <Edit />
                        </Button>
                        <Button variant="ghost">
                          <Trash color="red" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {showFlow && (
        <div className="fixed inset-0 w-screen h-screen bg-black/50 z-[2000] flex items-center justify-center">
          <div className="relative w-screen h-screen bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <button
              onClick={handleCloseFlow}
              className="absolute top-4 right-4 z-10 bg-black/5 border-none rounded-lg p-2 cursor-pointer flex items-center justify-center"
              title="Đóng"
            >
              <X size={24} />
            </button>
            <div className="flex-1 min-h-0">
              <Flow onClose={handleCloseFlow} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
