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
import type { MediaFile } from '../lib/data';
import { formatDuration, formatFileSize } from '../lib/data';

interface MediaFileCardProps {
  file: MediaFile;
}

export function MediaFileCard({ file }: MediaFileCardProps) {
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
    <Card className="cursor-pointer hover:shadow-lg transition-shadow group">
      <CardContent className="p-3">
        <div className="aspect-square bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
          {file.type === 'image' ? (
            <img
              src={file.thumbnail || file.url}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : file.type === 'video' ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
              <Video className="w-8 h-8 text-gray-400" />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                {file.duration && formatDuration(file.duration)}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              {getFileIcon(file.type)}
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-white shadow-sm"
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </h4>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatFileSize(file.size * 1024 * 1024)}</span>
            {file.dimensions && (
              <span>
                {file.dimensions.width}×{file.dimensions.height}
              </span>
            )}
          </div>
          {file.usedInProjects && file.usedInProjects.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Used in {file.usedInProjects.length}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
