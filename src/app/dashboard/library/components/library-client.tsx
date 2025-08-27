'use client';

import { FolderSidebar } from '@/app/dashboard/library/components/folder-sidebar';
import { useGetListFolder, useLibrary } from '@/queries/useLibrary';
import type { S3ListBucketResultType } from '@/types/library';
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { MediaFile, MediaFolder } from '../lib/data';
import { ActionsBar } from './actions-bar';
import { MediaContent } from './media-content';
import { UploadNotification, type UploadFile } from './upload-notification';

type LibraryClientProps = {
  initialFolders: MediaFolder[];
  initialFiles: MediaFile[];
  userId: string; // Add userId prop
};

export const LibraryClient: FC<LibraryClientProps> = ({
  initialFolders,
  initialFiles,
  userId,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isNotificationVisible, setIsNotificationVisible] =
    useState<boolean>(false);
  const [isFolderPanelCollapsed, setIsFolderPanelCollapsed] =
    useState<boolean>(false);
  const [localFolders, setLocalFolders] =
    useState<MediaFolder[]>(initialFolders);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isNewFolderOpen, setIsNewFolderOpen] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([
    'game-assets',
    'ui-elements',
  ]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const presign = useLibrary();

  // S3 API calls - chỉ fetch folders trước
  const [foldersQuery] = useGetListFolder(userId);

  // Handle loading and error states
  const isFoldersLoading = foldersQuery.isLoading;

  // Convert S3 response to MediaFolder format
  const convertS3ToMediaFolders = (
    s3Response: S3ListBucketResultType,
  ): MediaFolder[] => {
    if (!s3Response?.ListBucketResult?.CommonPrefixes) {
      return [];
    }

    const prefixes = Array.isArray(s3Response.ListBucketResult.CommonPrefixes)
      ? s3Response.ListBucketResult.CommonPrefixes
      : [s3Response.ListBucketResult.CommonPrefixes];

    return prefixes.map((prefix) => {
      const pathParts = prefix.Prefix.split('/').filter(Boolean);
      // Extract only the folder name (last part before trailing slash)
      // From: df23285e-75a8-4b71-8549-01972084fa7d/abc/
      // We want: abc
      const folderName = pathParts[pathParts.length - 1] || 'Root';

      return {
        id: prefix.Prefix,
        name: folderName,
        fileCount: 0, // Will be updated when we get file count
        size: 0, // Will be updated when we get folder size
        color: 'blue', // Default color
        parentId: undefined, // No parent for root level folders
        isExpanded: expandedFolders.includes(prefix.Prefix),
      };
    });
  };

  // Update folders when S3 data changes
  useEffect(() => {
    if (foldersQuery.data) {
      const s3Folders = convertS3ToMediaFolders(foldersQuery.data);
      setLocalFolders(s3Folders);
    }
  }, [foldersQuery.data]);

  // Chỉ sử dụng initialFiles cho bây giờ
  const filteredFiles = initialFiles.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFolder =
      selectedFolder === 'all' ||
      selectedFolder === 'recent' ||
      file.folder === selectedFolder ||
      (localFolders.find((f) => f.id === selectedFolder)?.parentId &&
        localFolders.find((f) => f.id === file.folder)?.parentId ===
          selectedFolder);
    return matchesSearch && matchesFolder;
  });

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId],
    );
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const fileArray = Array.from(files);
      const hasOnlyAllowedTypes = fileArray.every((file) =>
        allowedMimeTypes.includes(file.type),
      );

      if (!hasOnlyAllowedTypes) {
        toast.error('Only PNG and JPEG (jpg, jpeg) are supported.');
        event.target.value = '';
        return;
      }

      void (async () => {
        try {
          // create list file upload with initial status
          const newUploadFiles: UploadFile[] = fileArray.map((file, index) => ({
            id: `${Date.now()}-${index}`,
            name: file.name,
            status: 'uploading' as const,
            progress: 0,
          }));

          setUploadFiles(newUploadFiles);
          setIsNotificationVisible(true);

          const body = {
            file_list: fileArray.map((f) => ({
              path: 'abc/',
              file_name: f.name,
            })),
          };

          const res = await presign.mutateAsync(body);
          const items = res.data?.data ?? [];

          // Upload each file with progress tracking
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const file = fileArray.find((f) => f.name === item.file_name);
            if (!file) continue;

            const uploadFile = newUploadFiles[i];

            try {
              // Use XMLHttpRequest to track actual progress
              await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                  if (event.lengthComputable) {
                    const progress = Math.round(
                      (event.loaded / event.total) * 100,
                    );
                    setUploadFiles((prev) =>
                      prev.map((f) =>
                        f.id === uploadFile.id ? { ...f, progress } : f,
                      ),
                    );
                  }
                });

                xhr.addEventListener('load', () => {
                  if (xhr.status >= 200 && xhr.status < 300) {
                    // update status success
                    setUploadFiles((prev) =>
                      prev.map((f) =>
                        f.id === uploadFile.id
                          ? { ...f, status: 'success' as const, progress: 100 }
                          : f,
                      ),
                    );
                    resolve();
                  } else {
                    reject(
                      new Error(`Upload failed with status: ${xhr.status}`),
                    );
                  }
                });

                xhr.addEventListener('error', () => {
                  reject(new Error('Network error during upload'));
                });

                xhr.open('PUT', item.presigned_url);
                xhr.send(file);
              });
            } catch (error) {
              console.error(error);
              // update status error
              setUploadFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadFile.id
                    ? { ...f, status: 'error' as const }
                    : f,
                ),
              );
            }
          }

          // auto hide notification after 5 seconds if all success
          const allSuccess = newUploadFiles.every(
            (f) => f.status === 'success',
          );
          if (allSuccess) {
            setTimeout(() => {
              setIsNotificationVisible(false);
              setUploadFiles([]);
            }, 5000);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Upload error';
          toast.error(msg);
          setIsNotificationVisible(false);
          setUploadFiles([]);
        } finally {
          event.target.value = '';
        }
      })();
    }
  };

  const cancelNewFolder = () => {
    setIsNewFolderOpen(false);
    setNewFolderName('');
  };

  const createNewFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    const newFolder: MediaFolder = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      fileCount: 0,
      size: 0,
      color: 'blue',
    };
    setLocalFolders((prev) => [newFolder, ...prev]);
    setIsNewFolderOpen(false);
    setNewFolderName('');
  };

  return (
    <>
      {/* Upload Notification */}
      <UploadNotification
        files={uploadFiles}
        isVisible={isNotificationVisible}
        onClose={() => {
          setIsNotificationVisible(false);
          setUploadFiles([]);
        }}
        onMinimize={() => setIsNotificationVisible(false)}
      />

      {/* Actions Bar */}
      <ActionsBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUpload={handleFileUpload}
        onNewFolder={() => setIsNewFolderOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex gap-6 flex-1 w-full min-h-0 overflow-hidden">
        {/* Folders Sidebar */}
        {isFoldersLoading ? (
          <div className="w-64 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ) : (
          <FolderSidebar
            folders={localFolders}
            selectedFolder={selectedFolder}
            onFolderSelect={setSelectedFolder}
            folderSearchQuery={folderSearchQuery}
            onFolderSearchChange={setFolderSearchQuery}
            isCollapsed={isFolderPanelCollapsed}
            onToggleCollapse={() =>
              setIsFolderPanelCollapsed(!isFolderPanelCollapsed)
            }
            expandedFolders={expandedFolders}
            onToggleFolderExpansion={toggleFolderExpansion}
          />
        )}

        {/* Main Content */}
        <MediaContent
          files={filteredFiles}
          folders={localFolders}
          selectedFolder={selectedFolder}
          viewMode={viewMode}
          onFolderOpen={setSelectedFolder}
          onCreateFolder={() => setIsNewFolderOpen(true)}
          onUploadFiles={handleFileUpload}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-background border rounded-lg p-4 w-[360px] space-y-3">
            <div className="text-sm font-medium">Create new folder</div>
            <input
              className="w-full border rounded px-3 py-2 bg-transparent"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  createNewFolder();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelNewFolder();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 text-sm border rounded"
                onClick={cancelNewFolder}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 text-sm rounded bg-primary text-primary-foreground"
                onClick={createNewFolder}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
