'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Settings, Trash2 } from 'lucide-react';
import type { MediaFile, MediaFolder } from '../lib/data';
import { MediaFileCard } from './media-file-card';
import { MediaFileListItem } from './media-file-list-item';

interface MediaContentProps {
  files: MediaFile[];
  folders: MediaFolder[];
  selectedFolder: string;
  viewMode: 'grid' | 'list';
}

export function MediaContent({
  files,
  folders,
  selectedFolder,
  viewMode,
}: MediaContentProps) {
  const selectedFolderData = folders.find((f) => f.id === selectedFolder);

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {files.map((file) => (
        <MediaFileCard key={file.id} file={file} />
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
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
}
