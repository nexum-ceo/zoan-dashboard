'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Archive,
  FileText,
  ImageIcon,
  MoreVertical,
  Music,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import type { MediaFile } from '../lib/data';
import { formatDuration, formatFileSize } from '../lib/data';

interface MediaFileListItemProps {
  file: MediaFile;
}

export function MediaFileListItem({ file }: MediaFileListItemProps) {
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
    <Card className="cursor-pointer hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          test test test
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {file.type === 'image' ? (
              <Image
                // src={file.thumbnail || file.url}
                src={
                  'https://minio.buymed.site/library/df23285e-75a8-4b71-8549-01972084fa7d/abc/giga-archery.png'
                }
                // alt={file.name}
                alt="test"
                className="w-full h-full object-cover rounded-lg"
                width={64}
                height={64}
              />
            ) : (
              getFileIcon(file.type)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{file.name}</h4>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              <span>{formatFileSize(file.size * 1024 * 1024)}</span>
              {file.dimensions && (
                <span>
                  {file.dimensions.width}×{file.dimensions.height}
                </span>
              )}
              {file.duration && <span>{formatDuration(file.duration)}</span>}
              <span>{file.uploadDate.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {file.usedInProjects && file.usedInProjects.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {file.usedInProjects.length} project
                {file.usedInProjects.length > 1 ? 's' : ''}
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
