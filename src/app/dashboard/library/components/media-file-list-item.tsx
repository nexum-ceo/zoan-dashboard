'use client';

import { Button } from '@/components/ui/button';
import {
  Archive,
  FileText,
  ImageIcon,
  MoreVertical,
  Music,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import type { FC } from 'react';
import type { MediaFile } from '../lib/data';
import { formatDuration, formatFileSize } from '../lib/data';

type MediaFileListItemProps = {
  file: MediaFile;
};

export const MediaFileListItem: FC<MediaFileListItemProps> = ({ file }) => {
  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-green-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-gray-500" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="px-3 py-2 rounded-md hover:bg-muted/40 transition-colors">
      <div className="flex items-center justify-between gap-3 h-9">
        {/* Left: icon + name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            {file.type === 'image' ? (
              <Image
                src={file.thumbnail || file.url}
                alt={file.name}
                className="w-full h-full object-contain rounded-sm"
                width={24}
                height={24}
              />
            ) : (
              <span className="inline-flex items-center justify-center w-6 h-6">
                {getFileIcon(file.type)}
              </span>
            )}
          </div>
          <span className="truncate text-sm font-medium">{file.name}</span>
        </div>

        {/* Right: meta */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground whitespace-nowrap">
          {file.duration && <span>{formatDuration(file.duration)}</span>}
          <span>{file.uploadDate.toLocaleDateString()}</span>
          <span>{formatFileSize(file.size)}</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
