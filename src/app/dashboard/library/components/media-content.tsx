'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Folder, MoreVertical, Settings, Trash2 } from 'lucide-react';
import { FC } from 'react';
import type { MediaFile, MediaFolder } from '../lib/data';
import { MediaFileCard } from './media-file-card';
import { MediaFileListItem } from './media-file-list-item';

type MediaContentProps = {
  files: MediaFile[];
  folders: MediaFolder[];
  selectedFolder: string;
  viewMode: 'grid' | 'list';
  onFolderOpen?: (folderId: string) => void;
};

export const MediaContent: FC<MediaContentProps> = ({
  files,
  folders,
  selectedFolder,
  viewMode,
  onFolderOpen,
}) => {
  const selectedFolderData = folders.find((f) => f.id === selectedFolder);

  const topLevelFolders = folders.filter(
    (f) => !f.parentId && f.id !== 'all' && f.id !== 'recent',
  );

  const renderGridView = () => (
    <div className="space-y-4">
      {/* Folders grid (wrap like Drive) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {topLevelFolders.map((folder) => (
          <div
            key={folder.id}
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
        ))}
      </div>

      {/* Files grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {files.map((file) => (
          <MediaFileCard key={file.id} file={file} />
        ))}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-1">
      {/* Folders first */}
      {topLevelFolders.map((folder) => (
        <button
          key={folder.id}
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
      ))}

      {/* Files */}
      {files.map((file) => (
        <MediaFileListItem key={file.id} file={file} />
      ))}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">
            {selectedFolderData?.name || 'All Files'}
          </h2>
          <Badge variant="secondary">{files.length} files</Badge>
          {selectedFolder !== 'all' && selectedFolder !== 'recent' && (
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
};
