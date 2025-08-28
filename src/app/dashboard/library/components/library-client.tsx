'use client';

import { FolderSidebar } from '@/app/dashboard/library/components/folder-sidebar';
import { putZeroByte, s3ToMediaFiles, s3ToMediaFolders } from '@/lib/s3';
import { decodeBase64Url, encodeBase64Url } from '@/lib/utils';
import {
  useDelete,
  useGetListFileInFolder,
  useGetListFolder,
  useLibrary,
} from '@/queries/useLibrary';
import type { S3ListBucketResultType } from '@/types/library';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import type { MediaFile, MediaFolder } from '../lib/data';
import { ActionsBar } from './actions-bar';
import { MediaContent } from './media-content';
import { UploadNotification, type UploadFile } from './upload-notification';

type LibraryClientProps = {
  userId: string;
};

export const LibraryClient: FC<LibraryClientProps> = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>('');
  // currentPrefix is the absolute S3 prefix for the current view, e.g. `${userId}/abc/`
  const [currentPrefix, setCurrentPrefix] = useState<string>(`${userId}/`);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isNotificationVisible, setIsNotificationVisible] =
    useState<boolean>(false);
  const [isFolderPanelCollapsed, setIsFolderPanelCollapsed] =
    useState<boolean>(false);
  const [localFolders, setLocalFolders] = useState<MediaFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isNewFolderOpen, setIsNewFolderOpen] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([
    'game-assets',
    'ui-elements',
  ]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const presign = useLibrary();
  const deleteMutation = useDelete();
  const router = useRouter();
  const searchParams = useSearchParams();

  // initialize currentPrefix from URL `p` param (base64url), fallback to root
  useEffect(() => {
    const p = searchParams.get('p');
    if (p) {
      const decoded = decodeBase64Url(p);
      if (decoded) {
        setCurrentPrefix(decoded.endsWith('/') ? decoded : `${decoded}/`);
        return;
      }
    }
    setCurrentPrefix(`${userId}/`);
  }, [searchParams, userId]);

  // keep URL in sync when currentPrefix changes
  useEffect(() => {
    if (!currentPrefix) return;
    const encoded = encodeBase64Url(currentPrefix);
    const url = new URL(window.location.href);
    url.searchParams.set('p', encoded);
    router.replace(url.pathname + '?' + url.searchParams.toString());
  }, [currentPrefix, router]);

  // S3 API calls - fetch folders and files
  const foldersQuery = useGetListFolder(userId);
  // derive folder path relative to user root for API
  const relativeFolderPath =
    currentPrefix.replace(new RegExp(`^${userId}/?`), '') || 'all';
  const filesInFolderQuery = useGetListFileInFolder(userId, relativeFolderPath);

  // Handle loading and error states
  const isFoldersLoading = foldersQuery.isLoading;

  // Convert S3 response to MediaFolder format
  const convertS3ToMediaFolders = useCallback(
    (s3Response: S3ListBucketResultType): MediaFolder[] =>
      s3ToMediaFolders(s3Response, expandedFolders),
    [expandedFolders],
  );

  // Convert S3 response to MediaFile format
  const convertS3ToMediaFiles = useCallback(
    (
      s3Response: S3ListBucketResultType | undefined,
      currentUserId: string,
    ): MediaFile[] => s3ToMediaFiles(s3Response, currentUserId),
    [],
  );

  // Update folders when S3 data changes
  useEffect(() => {
    if (foldersQuery.data) {
      const s3Folders = convertS3ToMediaFolders(foldersQuery.data);
      setLocalFolders(s3Folders);
    }
  }, [foldersQuery.data, convertS3ToMediaFolders]);

  // Extract folders and files from current folder data
  const currentFolderData = filesInFolderQuery?.data as S3ListBucketResultType;

  // Get folders (CommonPrefixes) from current folder
  const currentFolders: MediaFolder[] = currentFolderData
    ? convertS3ToMediaFolders(currentFolderData)
    : [];

  // Get files (Contents) from current folder
  const currentFiles: MediaFile[] = currentFolderData
    ? convertS3ToMediaFiles(currentFolderData, userId)
    : [];

  // When at root level, use folders from the main folders query
  const displayFolders =
    currentPrefix === `${userId}/` ? localFolders : currentFolders;

  // Filter files based on search
  const filteredFiles = currentFiles.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter folders based on search
  const filteredFolders = displayFolders.filter((folder) => {
    const matchesSearch = folder.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
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

          // compute current folder path relative to user root
          const relativeCurrent = currentPrefix.replace(
            new RegExp(`^${userId}/?`),
            '',
          );

          const body = {
            file_list: fileArray.map((f) => ({
              path: relativeCurrent,
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
          // refresh current folder
          await filesInFolderQuery.refetch?.();
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

  const createNewFolder = async () => {
    const rawName = newFolderName.trim();
    if (!rawName) return;

    const safeName = rawName.replace(/\s+/g, '-');

    // Determine parent prefix (S3 style) from selection
    const parentPrefix = currentPrefix.endsWith('/')
      ? currentPrefix
      : `${userId}/`;

    // Convert absolute prefix to path relative to user root for API body
    const relativeParent = parentPrefix.replace(new RegExp(`^${userId}/?`), '');
    const path = `${relativeParent}${safeName}/`;

    try {
      const body = {
        file_list: [
          {
            path,
            file_name: '',
          },
        ],
      };

      const res = await presign.mutateAsync(body);
      const item = res.data?.data?.[0];
      if (!item?.presigned_url) {
        throw new Error('Failed to get presigned url for folder');
      }

      // Perform zero-byte PUT to create the folder placeholder object
      await putZeroByte(item.presigned_url);

      // Optimistic UI: add to expanded list and refresh folders from S3
      setExpandedFolders((prev) =>
        prev.includes(parentPrefix) ? prev : [...prev, parentPrefix],
      );

      await foldersQuery.refetch?.();
      await filesInFolderQuery.refetch?.();

      toast.success('Folder created');
      setIsNewFolderOpen(false);
      setNewFolderName('');
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Create folder error';
      toast.error(msg);
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await deleteMutation.mutateAsync(path);
      toast.success('Item deleted successfully');
      // Refresh both folders and current folder data
      await foldersQuery.refetch?.();
      await filesInFolderQuery.refetch?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Delete error';
      toast.error(msg);
    }
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
            selectedFolder={currentPrefix}
            onFolderSelect={setCurrentPrefix}
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
        {filesInFolderQuery.isLoading ? (
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-lg bg-gray-100 dark:bg-gray-900 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <MediaContent
            files={filteredFiles}
            folders={filteredFolders}
            selectedFolder={currentPrefix}
            rootPrefix={`${userId}/`}
            viewMode={viewMode}
            onFolderOpen={setCurrentPrefix}
            onCreateFolder={() => setIsNewFolderOpen(true)}
            onUploadFiles={handleFileUpload}
            onDelete={handleDelete}
          />
        )}
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
