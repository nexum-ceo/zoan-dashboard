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
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom';
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

type MediaFileCardProps = {
  file: MediaFile;
  onDelete?: (filePath: string) => void;
  readOnly?: boolean;
};

export const MediaFileCard: FC<MediaFileCardProps> = ({
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
      toast.error(`Can not delete file "${file.name}". Please try again.`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="p-0 cursor-pointer hover:shadow-lg transition-shadow group">
        <CardContent className="p-3">
          <div className="aspect-square bg-gray-100 rounded-lg mb-3 relative">
            {file.type === 'image' ? (
              <ImageZoom
                backdropClassName="[&_[data-rmiz-modal-overlay=visible]]:bg-black/80"
                className="w-full h-full rounded-lg"
              >
                <Image
                  fill
                  quality={100}
                  src={file.thumbnail || file.url}
                  alt={file.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </ImageZoom>
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

            {!readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm border"
                      disabled={isDeleting}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
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

          <div className="space-y-1">
            <h4 className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </h4>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatFileSize(file.size)}</span>
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
