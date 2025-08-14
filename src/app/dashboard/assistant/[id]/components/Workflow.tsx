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
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

import { Flow } from '@/app/dashboard/assistant/[id]/components/Flow';
import { formatDate } from '@/lib/date';
import { handleErrorApi } from '@/lib/utils';
import {
  useCreateWorkflowMutation,
  useDeleteWorkflowMutation,
  useGetWorkflowList,
} from '@/queries/useWorkflow';
import type { CreateWorkflowType } from '@/types/workflow';
import { WorkflowType } from '@/types/workflow';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Workflow() {
  const [showFlow, setShowFlow] = useState<boolean>(false);
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

  // Fetch workflows using hook
  const {
    data: workflowData,
    isLoading: loading,
    error,
  } = useGetWorkflowList();

  // Delete workflow mutation hook
  const {
    mutate: deleteWorkflow,
    isPending: deleteLoading,
    error: deleteError,
  } = useDeleteWorkflowMutation();

  // Create workflow mutation hook
  const {
    mutate: createWorkflow,
    isPending: createLoading,
    error: createError,
  } = useCreateWorkflowMutation();

  // Process workflow data
  const workflows: WorkflowType[] = Array.isArray(workflowData?.data)
    ? workflowData.data
    : Array.isArray(workflowData)
    ? workflowData
    : [];

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
  const handleAddWorkflow = (e?: FormEvent) => {
    if (e) e.preventDefault();

    const body: CreateWorkflowType = {
      name: newName,
      description: newDesc,
    };

    createWorkflow(body, {
      onSuccess: () => {
        setShowFlow(true);
        setOpenDialog(false);
        setNewName('');
        setNewDesc('');
        toast.success('Create workflow successfully!');
      },
      onError: (err) => {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create workflow';
        toast.error(errorMessage);
        handleErrorApi({ error: err });
      },
    });
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (workflow: WorkflowType) => {
    setWorkflowToDelete(workflow);
    setDeleteDialogOpen(true);
  };

  // Call API delete workflow
  const handleDeleteWorkflow = () => {
    if (!workflowToDelete) return;

    deleteWorkflow(workflowToDelete.id, {
      onSuccess: () => {
        toast.success('Workflow deleted successfully!');
        setDeleteDialogOpen(false);
        setWorkflowToDelete(null);
      },
      onError: (err) => {
        handleErrorApi({
          error:
            err instanceof Error ? err : new Error('Failed to delete workflow'),
        });
      },
    });
  };

  return (
    <div className="flex flex-col rounded-lg gap-4 w-full h-full p-4 bg-background text-foreground">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2 justify-between items-center">
          <div className="text-lg font-medium flex flex-row gap-2 items-center text-foreground">
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
                    <label className="text-sm font-medium text-foreground">
                      Name
                    </label>
                    <input
                      className="border border-border rounded px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      placeholder="Enter workflow name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Description
                    </label>
                    <textarea
                      className="border border-border rounded px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      required
                      placeholder="Enter description"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createLoading}>
                      {createLoading ? 'Creating...' : 'Create'}
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
            <div className="text-center py-8 text-muted-foreground">
              Loading workflow...
            </div>
          ) : error || deleteError || createError ? (
            <div className="text-center text-destructive py-8">
              {error instanceof Error
                ? error.message
                : error ||
                  (deleteError instanceof Error
                    ? deleteError.message
                    : 'Delete error') ||
                  (createError instanceof Error
                    ? createError.message
                    : 'Create error')}
            </div>
          ) : (
            <Table className="border border-border rounded-lg">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Description</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Updated At</TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No workflows found
                    </TableCell>
                  </TableRow>
                ) : (
                  workflows.map((wf, idx) => (
                    <TableRow
                      key={wf.id || idx}
                      onClick={() => handleFlowClick(wf)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="text-foreground">
                        {wf.name || 'No name'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {wf.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        >
                          {wf.status || 'Published'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(wf.updated_at) || '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost">
                          <FileDown />
                        </Button>
                        <Button variant="ghost">
                          <Edit />
                        </Button>
                        <Button
                          variant="ghost"
                          className="hover:bg-muted"
                          disabled={deleteLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(wf);
                          }}
                        >
                          <Trash className="text-destructive hover:text-destructive/80" />
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
        <div className="fixed inset-0 w-screen h-screen bg-black/50 dark:bg-black/70 z-[2000] flex items-center justify-center">
          <div className="relative w-screen h-screen bg-background border border-border overflow-hidden shadow-2xl flex flex-col">
            <button
              onClick={handleCloseFlow}
              className="absolute top-4 right-4 z-10 bg-muted/80 hover:bg-muted border border-border rounded-lg p-2 cursor-pointer flex items-center justify-center transition-colors"
              title="Đóng"
            >
              <X size={24} className="text-foreground" />
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
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
