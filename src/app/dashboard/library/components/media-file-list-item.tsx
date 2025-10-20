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
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import {
  Archive,
  FileText,
  ImageIcon,
  MoreVertical,
  Music,
  Trash2,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import { FC, useState } from 'react';
import { toast } from 'sonner';
import type { MediaFile } from '../lib/data';
import { formatDuration, formatFileSize } from '../lib/data';

type MediaFileListItemProps = {
  file: MediaFile;
  onDelete?: (filePath: string) => void;
  readOnly?: boolean;
};

export const MediaFileListItem: FC<MediaFileListItemProps> = ({
  file,
  onDelete,
  readOnly,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      // Remove userId from the beginning of the path for delete API
      const relativePath = file.folder.replace(/^[^/]+\//, '');
      await onDelete(`${relativePath}${file.name}`);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.log(error);
      toast.error(
        `Can not delete file "${file.name}". Please try again later.`,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
            {!readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={isDeleting}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => window.open(file.url, '_blank')}
                    className="cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Open file
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete file
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete file</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete file{' '}
              <strong>&ldquo;{file.name}&rdquo;</strong>? This action cannot be
              undone and the file will be deleted permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Delete file'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
