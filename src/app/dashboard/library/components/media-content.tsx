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
  Badge,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
} from '@/components/ui';
import { buildBreadcrumbCrumbs } from '@/lib/utils';
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [folderToDelete, setFolderToDelete] = useState<MediaFolder | null>(
    null,
  );
  const isAssets = !!rootPrefix && rootPrefix.startsWith('assets/');

  // Build breadcrumb path using util
  const folderPath = buildBreadcrumbCrumbs(selectedFolder, rootPrefix);

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
                  className="group border rounded-lg px-2 py-0 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-12"
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
                    {!isAssets && (
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
                          {onDelete && (
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
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Files grid */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {files.map((file) => (
                <MediaFileCard
                  key={file.id}
                  file={file}
                  onDelete={onDelete}
                  readOnly={isAssets}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Show root folders when at root level */}
      {selectedFolder === rootPrefix && (
        <>
          {/* Root folders */}
          {currentFolders.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {currentFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="group border rounded-lg px-2 py-0 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-12"
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
                    {!isAssets && (
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
                          {onDelete && (
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
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Root files */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {files.map((file) => (
                <MediaFileCard
                  key={file.id}
                  file={file}
                  onDelete={onDelete}
                  readOnly={isAssets}
                />
              ))}
            </div>
          )}
        </>
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
              className="group border rounded-lg px-2 py-0 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-12"
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
                {!isAssets && (
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
                )}
              </div>
            </div>
          ))}

          {/* Files */}
          {files.map((file) => (
            <MediaFileListItem
              key={file.id}
              file={file}
              onDelete={onDelete}
              readOnly={isAssets}
            />
          ))}
        </>
      )}

      {/* Show root folders when at root level */}
      {selectedFolder === rootPrefix && (
        <>
          {currentFolders.map((folder) => (
            <div
              key={folder.id}
              className="group border rounded-lg px-2 py-0 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-12"
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
                    {onDelete && (
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
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {/* Root files in list view */}
          {files.map((file) => (
            <MediaFileListItem
              key={file.id}
              file={file}
              onDelete={onDelete}
              readOnly={isAssets}
            />
          ))}
        </>
      )}
    </div>
  );

  // Shared main content used with/without context menu
  const libraryBody = (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <Breadcrumb>
              <BreadcrumbList className="text-base">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (rootPrefix) onFolderOpen?.(rootPrefix);
                    }}
                  >
                    {rootPrefix?.startsWith('assets/')
                      ? 'Public Assets'
                      : 'Library'}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {folderPath.length > 0 ? (
                  <>
                    {folderPath.length > 2 ? (
                      <>
                        <BreadcrumbItem>
                          <BreadcrumbEllipsis />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink
                            href="#"
                            onClick={() =>
                              onFolderOpen?.(
                                folderPath[folderPath.length - 2]!.id,
                              )
                            }
                          >
                            {folderPath[folderPath.length - 2]!.name}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </>
                    ) : (
                      folderPath.slice(0, -1).map((f) => (
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
                      ))
                    )}
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {folderPath[folderPath.length - 1]?.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {selectedFolder === rootPrefix ? 'All Files' : 'Recent'}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Badge variant="secondary">
            {`${currentFolders.length} folders, ${files.length} files`}
          </Badge>
          {selectedFolder !== rootPrefix &&
            !rootPrefix?.startsWith('assets/') && (
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

      {!isAssets ? (
        <ContextMenu>
          <ContextMenuTrigger asChild>{libraryBody}</ContextMenuTrigger>
          <ContextMenuContent>
            {onCreateFolder && (
              <ContextMenuItem onClick={onCreateFolder}>
                <FolderPlus className="w-4 h-4 mr-2" />
                New folder
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
            {onUploadFiles && (
              <ContextMenuItem onClick={onUploadFiles}>
                <Upload className="w-4 h-4 mr-2" />
                Upload files
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        libraryBody
      )}
    </>
  );
};
