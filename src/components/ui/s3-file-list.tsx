'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  extractS3CommonPrefixes,
  extractS3Contents,
  formatFileSize,
} from '@/lib/utils';
import { useGetListFile } from '@/queries/useLibrary';
import { FileIcon, FolderIcon } from 'lucide-react';

interface S3FileListProps {
  userId: string;
  folderPath: string;
}

export function S3FileList({ userId, folderPath }: S3FileListProps) {
  const [listFileQuery] = useGetListFile(userId, folderPath);
  const { data, isLoading, error } = listFileQuery;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading files...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error loading files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load files: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No files found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">This folder is empty.</p>
        </CardContent>
      </Card>
    );
  }

  // Parse S3 response
  const files = extractS3Contents(data);
  const folders = extractS3CommonPrefixes(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files in {folderPath || 'root'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Folders */}
        {folders.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Folders</h3>
            <div className="space-y-2">
              {folders.map((folder, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 rounded-lg border hover:bg-gray-50"
                >
                  <FolderIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{folder.folderName}</span>
                  <Badge variant="secondary">Folder</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Files</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="font-medium">{file.fileName}</span>
                      <p className="text-xs text-gray-500">
                        {new Date(file.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{formatFileSize(file.size)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && folders.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No files or folders found
          </p>
        )}
      </CardContent>
    </Card>
  );
}
