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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Flow } from '@/app/dashboard/assistant/[id]/components/Flow';
import { formatDate } from '@/lib/date';
import { handleErrorApi } from '@/lib/utils';
import type { CreateWorkflowType } from '@/types/workflow';
import { WorkflowType } from '@/types/workflow';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Workflow() {
  const [showFlow, setShowFlow] = useState<boolean>(false);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<WorkflowType | null>(
    null,
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fetch workflows function
  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workflow');
      const data = await res.json();
      if (Array.isArray(data)) setWorkflows(data);
      else if (Array.isArray(data.data)) setWorkflows(data.data);
      else setWorkflows([]);
      setError(null);
    } catch (err) {
      setError('Error when fetching workflow');
      setWorkflows([]);
      handleErrorApi({ error: err });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleFlowClick = (workflow: WorkflowType) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('flow_id', workflow.id);
    router.replace(`${pathname}?${params.toString()}`);
    setSelectedWorkflow(workflow);
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
    setSelectedWorkflow(null);
  };

  // Call API create new workflow
  const handleAddWorkflow = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body: CreateWorkflowType = {
        name: newName,
        description: newDesc,
      };
      const res = await fetch('/api/workflow', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setWorkflows((prev) => [data, ...prev]);
        setShowFlow(true);
        setOpenDialog(false);
        setNewName('');
        setNewDesc('');
        toast.success('Create workflow successfully!');
      } else {
        setError(data?.error || 'Failed to create workflow');
        toast.error(data?.error || 'Failed to create workflow');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setError('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (workflow: WorkflowType) => {
    setWorkflowToDelete(workflow);
    setDeleteDialogOpen(true);
  };

  // Call API delete workflow
  const handleDeleteWorkflow = async () => {
    if (!workflowToDelete) return;

    try {
      const res = await fetch(`/api/workflow/${workflowToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Remove the deleted workflow from local state
        setWorkflows((prev) =>
          prev.filter((wf) => wf.id !== workflowToDelete.id),
        );
        toast.success('Workflow deleted successfully!');
        // Refresh the workflow list
        await fetchWorkflows();
        // Close dialog and reset state
        setDeleteDialogOpen(false);
        setWorkflowToDelete(null);
      } else {
        const data = await res.json();
        handleErrorApi({
          error: new Error(data?.error || 'Failed to delete workflow'),
        });
      }
    } catch (err) {
      handleErrorApi({ error: err });
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
                  <TableHead>Description</TableHead>
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
                      <TableCell>{wf.description || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-600 dark:bg-green-600"
                        >
                          {wf.status || 'Published'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(wf.updated_at) || '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost">
                          <FileDown />
                        </Button>
                        <Button variant="ghost">
                          <Edit />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(wf);
                          }}
                        >
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

      {showFlow && selectedWorkflow && (
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
              <Flow
                onClose={handleCloseFlow}
                workflowId={selectedWorkflow.id}
                workflowName={selectedWorkflow.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;
              {workflowToDelete?.name || 'Untitled workflow'}&quot;? This action
              cannot be undone and will permanently remove the workflow and all
              its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setWorkflowToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkflow}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
