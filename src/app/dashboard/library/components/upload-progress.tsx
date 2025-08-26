'use client';

import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
}

export function UploadProgress({ isUploading, progress }: UploadProgressProps) {
  if (!isUploading) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-900">
          Uploading files...
        </span>
        <span className="text-sm text-blue-700">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
