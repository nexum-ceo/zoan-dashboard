'use client';

import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  ChevronDown,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Loader2,
  X,
} from 'lucide-react';
import { FC, useState } from 'react';

export type UploadFile = {
  id: string;
  name: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
};

type UploadNotificationProps = {
  files: UploadFile[];
  isVisible: boolean;
  onClose: () => void;
  onMinimize: () => void;
};

export const UploadNotification: FC<UploadNotificationProps> = ({
  files,
  isVisible,
  onClose,
  onMinimize,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isVisible || files.length === 0) return null;

  const successfulFiles = files.filter((f) => f.status === 'success');
  const uploadingFiles = files.filter((f) => f.status === 'uploading');
  const errorFiles = files.filter((f) => f.status === 'error');

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <FileImage className="w-4 h-4 text-red-500" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) {
      return <FileVideo className="w-4 h-4 text-purple-500" />;
    }
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension || '')) {
      return <FileAudio className="w-4 h-4 text-green-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const getStatusIcon = (status: UploadFile['status'], progress?: number) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            {progress !== undefined && (
              <span className="text-xs text-blue-600 font-medium">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {successfulFiles.length > 0
              ? `Uploaded ${successfulFiles.length} items`
              : `Uploading ${uploadingFiles.length} items`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* File List */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
            >
              {getFileIcon(file.name)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{file.name}</p>
                {file.status === 'uploading' && file.progress !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {getStatusIcon(file.status, file.progress)}
            </div>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {successfulFiles.length} successful
              {uploadingFiles.length > 0 &&
                ` • ${uploadingFiles.length} uploading`}
              {errorFiles.length > 0 && ` • ${errorFiles.length} error`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onMinimize}
            >
              Minimize
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
