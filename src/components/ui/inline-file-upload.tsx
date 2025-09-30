'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback, useRef } from 'react';
import PaperClip from '../../../public/icon/paper-clip';

interface InlineFileUploadProps {
  onFilesSelected: (files: FileList) => void;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/*',
  'audio/*',
  'video/*',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  '.zip',
  '.rar',
  '.7z',
  '.fig',
  '.sketch',
];

export const InlineFileUpload = ({
  onFilesSelected,
  maxFiles = 10,
  maxFileSize = 50,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  className,
}: InlineFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        return `File size exceeds ${maxFileSize}MB limit`;
      }

      // Check file type
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });

      if (!isValidType) {
        return 'File type not supported';
      }

      return null;
    },
    [maxFileSize, acceptedTypes],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        // Validate files
        const fileArray = Array.from(files);
        const validFiles: File[] = [];
        const errors: string[] = [];

        fileArray.forEach((file) => {
          const error = validateFile(file);
          if (error) {
            errors.push(`${file.name}: ${error}`);
          } else {
            validFiles.push(file);
          }
        });

        if (errors.length > 0) {
          alert(errors.join('\n'));
        }

        if (validFiles.length === 0) return;

        // Check max files limit
        if (validFiles.length > maxFiles) {
          alert(`Maximum ${maxFiles} files allowed`);
          return;
        }

        // Create a new FileList with only valid files
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));

        onFilesSelected(dataTransfer.files);
      }

      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [maxFiles, onFilesSelected, validateFile],
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={openFileDialog}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <PaperClip className="w-4 h-4 text-gray-500" />
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};
