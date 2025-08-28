'use client';

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
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Edit,
  Folder,
  FolderPlus,
  MoreVertical,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react';
import { FC, Fragment, useState } from 'react';
import { toast } from 'sonner';
import type { MediaFile, MediaFolder } from '../lib/data';
import { MediaFileCard } from './media-file-card';
import { MediaFileListItem } from './media-file-list-item';

type MediaContentProps = {
  files: MediaFile[];
  folders: MediaFolder[];
  selectedFolder: string;
  rootPrefix?: string;
  viewMode: 'grid' | 'list';
  onFolderOpen?: (folderId: string) => void;
  onCreateFolder?: () => void;
  onUploadFiles?: () => void;
  onDelete?: (path: string) => void;
};

export const MediaContent: FC<MediaContentProps> = ({
  files,
  folders,
  selectedFolder,
  rootPrefix,
  viewMode,
  onFolderOpen,
  onCreateFolder,
  onUploadFiles,
  onDelete,
}) => {
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<MediaFolder | null>(
    null,
  );

  const selectedFolderData = folders.find((f) => f.id === selectedFolder);

  // Build breadcrumb path based on parentId chain
  const folderById = new Map(folders.map((f) => [f.id, f] as const));
  const buildFolderPath = () => {
    if (!selectedFolderData) return [] as MediaFolder[];
    const path: MediaFolder[] = [];
    let current: MediaFolder | undefined = selectedFolderData;
    while (current) {
      path.unshift(current);
      current = current.parentId ? folderById.get(current.parentId) : undefined;
    }
    return path;
  };
  const folderPath = buildFolderPath();

  // Use all folders passed from parent (these are already filtered for current folder)
  const currentFolders = folders;

  const handleFolderDelete = async (folder: MediaFolder) => {
    if (!onDelete) return;

    try {
      setDeletingFolder(folder.id);
      // Remove userId from the beginning of the path for delete API
      const relativePath = folder.id.replace(/^[^/]+\//, '');
      await onDelete(relativePath);
      setIsDeleteDialogOpen(false);
      setFolderToDelete(null);
    } catch (error) {
      console.log(error);
      toast.error(`Cannot delete folder "${folder.name}". Please try again.`);
    } finally {
      setDeletingFolder(null);
    }
  };

  const openDeleteDialog = (folder: MediaFolder) => {
    setFolderToDelete(folder);
    setIsDeleteDialogOpen(true);
  };

  const renderGridView = () => (
    <div className="space-y-4">
      {/* Show folders and files only when inside a subfolder */}
      {selectedFolder !== rootPrefix && (
        <>
          {/* Folders grid (wrap like Drive) */}
          {currentFolders.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {currentFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="group border rounded-lg p-3 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-16"
                >
                  <div className="flex items-center justify-between h-full">
                    <div
                      className="flex items-center gap-2 min-w-0 flex-1"
                      onClick={() => onFolderOpen?.(folder.id)}
                    >
                      <Folder className="w-4 h-4 text-foreground/80" />
                      <span className="font-medium text-sm truncate">
                        {folder.name}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                          disabled={deletingFolder === folder.id}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => onFolderOpen?.(folder.id)}
                          className="cursor-pointer"
                        >
                          <Folder className="w-4 h-4 mr-2" />
                          Open folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(folder)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                          disabled={deletingFolder === folder.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingFolder === folder.id
                            ? 'Deleting...'
                            : 'Delete folder'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Files grid */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {files.map((file) => (
                <MediaFileCard key={file.id} file={file} onDelete={onDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Show root folders when at root level */}
      {selectedFolder === rootPrefix && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {currentFolders.map((folder) => (
            <div
              key={folder.id}
              className="group border rounded-lg p-3 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-16"
            >
              <div className="flex items-center justify-between h-full">
                <div
                  className="flex items-center gap-2 min-w-0 flex-1"
                  onClick={() => onFolderOpen?.(folder.id)}
                >
                  <Folder className="w-4 h-4 text-foreground/80" />
                  <span className="font-medium text-sm truncate">
                    {folder.name}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      disabled={deletingFolder === folder.id}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onFolderOpen?.(folder.id)}
                      className="cursor-pointer"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Open folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(folder)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                      disabled={deletingFolder === folder.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingFolder === folder.id
                        ? 'Deleting...'
                        : 'Delete folder'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-1">
      {/* Show folders and files only when inside a subfolder */}
      {selectedFolder !== rootPrefix && (
        <>
          {/* Folders first */}
          {currentFolders.map((folder) => (
            <div
              key={folder.id}
              className="group border rounded-lg p-3 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-16"
            >
              <div className="flex items-center justify-between h-full">
                <div
                  className="flex items-center gap-2 min-w-0 flex-1"
                  onClick={() => onFolderOpen?.(folder.id)}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6">
                    <Folder className="w-5 h-5 text-foreground/80" />
                  </span>
                  <span className="truncate text-sm">{folder.name}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {folder.fileCount} files
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      disabled={deletingFolder === folder.id}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onFolderOpen?.(folder.id)}
                      className="cursor-pointer"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Open folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(folder)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                      disabled={deletingFolder === folder.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingFolder === folder.id
                        ? 'Deleting...'
                        : 'Delete folder'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {/* Files */}
          {files.map((file) => (
            <MediaFileListItem key={file.id} file={file} onDelete={onDelete} />
          ))}
        </>
      )}

      {/* Show root folders when at root level */}
      {selectedFolder === rootPrefix && (
        <>
          {currentFolders.map((folder) => (
            <div
              key={folder.id}
              className="group border rounded-lg p-3 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-16"
            >
              <div className="flex items-center justify-between h-full">
                <div
                  className="flex items-center gap-2 min-w-0 flex-1"
                  onClick={() => onFolderOpen?.(folder.id)}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6">
                    <Folder className="w-5 h-5 text-foreground/80" />
                  </span>
                  <span className="truncate text-sm">{folder.name}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {folder.fileCount} files
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      disabled={deletingFolder === folder.id}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onFolderOpen?.(folder.id)}
                      className="cursor-pointer"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Open folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(folder)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                      disabled={deletingFolder === folder.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingFolder === folder.id
                        ? 'Deleting...'
                        : 'Delete folder'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete folder &ldquo;
              {folderToDelete?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                folderToDelete && handleFolderDelete(folderToDelete)
              }
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (rootPrefix) onFolderOpen?.(rootPrefix);
                          }}
                        >
                          Library
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      {folderPath.length > 0 ? (
                        <>
                          {folderPath.slice(0, -1).map((f) => (
                            <Fragment key={f.id}>
                              <BreadcrumbItem>
                                <BreadcrumbLink
                                  href="#"
                                  onClick={() => onFolderOpen?.(f.id)}
                                >
                                  {f.name}
                                </BreadcrumbLink>
                              </BreadcrumbItem>
                              <BreadcrumbSeparator />
                            </Fragment>
                          ))}
                          <BreadcrumbItem>
                            <BreadcrumbPage>
                              {folderPath[folderPath.length - 1]?.name}
                            </BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      ) : (
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {selectedFolder === rootPrefix
                              ? 'All Files'
                              : 'Recent'}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      )}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <Badge variant="secondary">
                  {selectedFolder !== rootPrefix
                    ? `${currentFolders.length} folders, ${files.length} files`
                    : `${currentFolders.length} folders`}
                </Badge>
                {selectedFolder !== rootPrefix && (
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                {viewMode === 'grid' ? renderGridView() : renderListView()}
              </ScrollArea>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onCreateFolder}>
            <FolderPlus className="w-4 h-4 mr-2" />
            New folder
          </ContextMenuItem>
          <ContextMenuItem onClick={onUploadFiles}>
            <Upload className="w-4 h-4 mr-2" />
            Upload files
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
};
