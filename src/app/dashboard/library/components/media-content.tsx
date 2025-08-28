'use client';

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
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Edit,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderPlus,
  MoreVertical,
  Presentation,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react';
import { FC, Fragment } from 'react';
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

  const renderGridView = () => (
    <div className="space-y-4">
      {/* Show folders and files only when inside a subfolder */}
      {selectedFolder !== rootPrefix && (
        <>
          {/* Folders grid (wrap like Drive) */}
          {currentFolders.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {currentFolders.map((folder) => (
                <ContextMenu key={folder.id}>
                  <ContextMenuTrigger asChild>
                    <div
                      className="group border rounded-lg p-3 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-16"
                      onClick={() => onFolderOpen?.(folder.id)}
                    >
                      <div className="flex items-center justify-between h-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder className="w-4 h-4 text-foreground/80" />
                          <span className="font-medium text-sm truncate">
                            {folder.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => onFolderOpen?.(folder.id)}>
                      <Folder className="w-4 h-4 mr-2" />
                      Open
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => {
                        // Remove userId from the beginning of the path for delete API
                        const relativePath = folder.id.replace(/^[^/]+\//, '');
                        onDelete?.(relativePath);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
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
            <ContextMenu key={folder.id}>
              <ContextMenuTrigger asChild>
                <div
                  className="group border rounded-lg p-3 bg-muted/40 hover:bg-muted transition-colors cursor-pointer h-16"
                  onClick={() => onFolderOpen?.(folder.id)}
                >
                  <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className="w-4 h-4 text-foreground/80" />
                      <span className="font-medium text-sm truncate">
                        {folder.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => onFolderOpen?.(folder.id)}>
                  <Folder className="w-4 h-4 mr-2" />
                  Open
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => {
                    // Remove userId from the beginning of the path for delete API
                    const relativePath = folder.id.replace(/^[^/]+\//, '');
                    onDelete?.(relativePath);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
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
            <ContextMenu key={folder.id}>
              <ContextMenuTrigger asChild>
                <button
                  onClick={() => onFolderOpen?.(folder.id)}
                  className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center w-6 h-6">
                      <Folder className="w-5 h-5 text-foreground/80" />
                    </span>
                    <span className="truncate text-sm">{folder.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {folder.fileCount} files
                  </span>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => onFolderOpen?.(folder.id)}>
                  <Folder className="w-4 h-4 mr-2" />
                  Open
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => {
                    // Remove userId from the beginning of the path for delete API
                    const relativePath = folder.id.replace(/^[^/]+\//, '');
                    onDelete?.(relativePath);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
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
            <ContextMenu key={folder.id}>
              <ContextMenuTrigger asChild>
                <button
                  onClick={() => onFolderOpen?.(folder.id)}
                  className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center w-6 h-6">
                      <Folder className="w-5 h-5 text-foreground/80" />
                    </span>
                    <span className="truncate text-sm">{folder.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {folder.fileCount} files
                  </span>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => onFolderOpen?.(folder.id)}>
                  <Folder className="w-4 h-4 mr-2" />
                  Open
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => {
                    // Remove userId from the beginning of the path for delete API
                    const relativePath = folder.id.replace(/^[^/]+\//, '');
                    onDelete?.(relativePath);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </>
      )}
    </div>
  );

  return (
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
          <FolderPlus className="w-4 h-4" />
          New folder
        </ContextMenuItem>
        <ContextMenuItem onClick={onUploadFiles}>
          <Upload className="w-4 h-4" />
          Upload files
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>
          <FileText className="w-4 h-4" />
          Docs
        </ContextMenuItem>
        <ContextMenuItem disabled>
          <FileSpreadsheet className="w-4 h-4" />
          Sheets
        </ContextMenuItem>
        <ContextMenuItem disabled>
          <Presentation className="w-4 h-4" />
          Slides
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
