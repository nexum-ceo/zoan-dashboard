'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUpload, type UploadedFile } from '@/components/ui/file-upload';
import { useState } from 'react';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
}

export const FileUploadDialog = ({
  open,
  onOpenChange,
  onFilesUploaded,
  maxFiles = 10,
  maxFileSize = 50,
}: FileUploadDialogProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    onFilesUploaded?.(files);
  };

  const handleClose = () => {
    setUploadedFiles([]);
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onFilesUploaded?.(uploadedFiles);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            maxFiles={maxFiles}
            maxFileSize={maxFileSize}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              uploadedFiles.length === 0 ||
              uploadedFiles.some((f) => f.status === 'uploading')
            }
          >
            Confirm ({uploadedFiles.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
