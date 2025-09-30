'use client';

import libraryApiRequest from '@/api-requests/library';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getMediaTypeFromFilename } from '@/lib/s3';
import { cn } from '@/lib/utils';
import {
  Archive,
  File,
  FileText,
  Image,
  Music,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useRef, useState } from 'react';

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

interface FileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/*',
  'audio/*',
  'video/*',
  'application/pdf',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  '.fig',
  '.sketch',
];

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

export const FileUpload = ({
  onFilesUploaded,
  maxFiles = 10,
  maxFileSize = 50, // 50MB
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  className,
}: FileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

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

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile> => {
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'uploading',
      };

      try {
        if (!session?.user?.id) {
          throw new Error('User not authenticated');
        }

        // Generate unique file path
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const filePath = `${session.user.id}/${fileName}`;

        // Get presigned URL
        const presignedResponse = await libraryApiRequest.sGetPresignedUrls({
          file_list: [
            {
              path: filePath,
              file_name: fileName,
            },
          ],
        });

        if (
          !presignedResponse.data ||
          !Array.isArray(presignedResponse.data) ||
          presignedResponse.data.length === 0
        ) {
          throw new Error('Failed to get presigned URL');
        }

        const presignedUrl = presignedResponse.data[0]?.presigned_url;
        if (!presignedUrl) {
          throw new Error('Invalid presigned URL response');
        }

        // Upload file using presigned URL with progress tracking
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadedFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadedFile.id ? { ...f, progress } : f,
                ),
              );
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || '';
              const fileUrl = `${baseUrl}/library/${filePath}`;

              setUploadedFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadedFile.id
                    ? { ...f, progress: 100, status: 'completed', url: fileUrl }
                    : f,
                ),
              );

              resolve({
                ...uploadedFile,
                progress: 100,
                status: 'completed',
                url: fileUrl,
              });
            } else {
              throw new Error(`Upload failed with status: ${xhr.status}`);
            }
          });

          xhr.addEventListener('error', () => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? {
                      ...f,
                      status: 'error',
                      error: 'Network error during upload',
                    }
                  : f,
              ),
            );
            reject(new Error('Network error during upload'));
          });

          xhr.open('PUT', presignedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: 'error',
                  error:
                    error instanceof Error ? error.message : 'Upload failed',
                }
              : f,
          ),
        );
        throw error;
      }
    },
    [session?.user?.id],
  );

  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      // Check max files limit
      if (uploadedFiles.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

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

      // Add files to state
      const newUploadedFiles: UploadedFile[] = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'uploading',
      }));

      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

      // Upload files
      try {
        const uploadPromises = validFiles.map((file) => uploadFile(file));
        const completedFiles = await Promise.all(uploadPromises);
        onFilesUploaded?.(completedFiles);
      } catch (error) {
        console.error('Upload error:', error);
      }
    },
    [uploadedFiles.length, maxFiles, onFilesUploaded, uploadFile, validateFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFiles],
  );

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer',
          isDragOver
            ? 'border-primary-brand-darker-green bg-primary-brand-darker-green/5'
            : 'border-gray-300 hover:border-gray-400',
          uploadedFiles.length > 0 && 'mb-4',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center justify-center py-6">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Drag and drop files here or{' '}
            <span className="text-primary-brand-darker-green font-medium">
              click to select
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Supported: Images, Audio, Video, PDF, Zip (Max {maxFileSize}MB)
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          {uploadedFiles.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* File Icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                {getFileIcon(uploadedFile.file)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {getFileTypeLabel(uploadedFile.file)} •{' '}
                  {formatFileSize(uploadedFile.file.size)}
                </p>

                {/* Progress Bar */}
                {uploadedFile.status === 'uploading' && (
                  <Progress value={uploadedFile.progress} className="h-1" />
                )}

                {/* Error Message */}
                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <p className="text-xs text-red-500">{uploadedFile.error}</p>
                )}

                {/* Success Indicator */}
                {uploadedFile.status === 'completed' && (
                  <p className="text-xs text-green-500">
                    ✓ Upload completed successfully
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
