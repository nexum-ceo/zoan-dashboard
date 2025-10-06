'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getMediaTypeFromFilename } from '@/lib/s3';
import { cn } from '@/lib/utils';
import { Archive, File, FileText, Image, Music, Video, X } from 'lucide-react';
import type { UploadedFile } from './file-upload';

interface AttachedFilesProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  className?: string;
}

const getFileIcon = (file: File) => {
  const mediaType = getMediaTypeFromFilename(file.name);

  switch (mediaType) {
    case 'image':
      return <Image className="w-4 h-4" />;
    case 'audio':
      return <Music className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'archive':
      return <Archive className="w-4 h-4" />;
    case 'document':
      return <FileText className="w-4 h-4" />;
    default:
      return <File className="w-4 h-4" />;
  }
};

const getFileTypeLabel = (file: File) => {
  const mediaType = getMediaTypeFromFilename(file.name);

  switch (mediaType) {
    case 'image':
      return 'Image';
    case 'audio':
      return 'Audio';
    case 'video':
      return 'Video';
    case 'archive':
      return 'Archive';
    case 'document':
      return 'Document';
    default:
      return 'File';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const AttachedFiles = ({
  files,
  onRemoveFile,
  className,
}: AttachedFilesProps) => {
  if (files.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 p-3 bg-gray-50 rounded-t-xl border-b',
        className,
      )}
    >
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border shadow-sm max-w-xs"
        >
          {/* File Icon */}
          <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
            {getFileIcon(file.file)}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-900 truncate">
                {file.file.name}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(file.id)}
                className="h-5 w-5 p-0 hover:bg-gray-200 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {getFileTypeLabel(file.file)} • {formatFileSize(file.file.size)}
            </p>

            {/* Progress Bar */}
            {file.status === 'uploading' && (
              <div className="mt-1">
                <Progress value={file.progress} className="h-1" />
              </div>
            )}

            {/* Error Message */}
            {file.status === 'error' && file.error && (
              <p className="text-xs text-red-500 mt-1">{file.error}</p>
            )}

            {/* Success Indicator */}
            {file.status === 'completed' && (
              <p className="text-xs text-green-500 mt-1">✓ Ready</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
