'use client';

import { useLibrary } from '@/queries/useLibrary';
import { ChangeEvent, FC, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { MediaFile, MediaFolder } from '../lib/data';
import { ActionsBar } from './actions-bar';
import { FolderSidebar } from './folder-sidebar';
import { MediaContent } from './media-content';
import { UploadProgress } from './upload-progress';

type LibraryClientProps = {
  initialFolders: MediaFolder[];
  initialFiles: MediaFile[];
};

export const LibraryClient: FC<LibraryClientProps> = ({
  initialFolders,
  initialFiles,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
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

  const filteredFiles = initialFiles.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFolder =
      selectedFolder === 'all' ||
      selectedFolder === 'recent' ||
      file.folder === selectedFolder ||
      (initialFolders.find((f) => f.id === selectedFolder)?.parentId &&
        initialFolders.find((f) => f.id === file.folder)?.parentId ===
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
          setIsUploading(true);
          setUploadProgress(0);

          const body = {
            file_list: fileArray.map((f) => ({
              path: 'abc/',
              file_name: f.name,
            })),
          };

          const res = await presign.mutateAsync(body);
          const items = res.data?.data ?? [];

          let completed = 0;
          await Promise.all(
            items.map(
              async (item: { presigned_url: string; file_name: string }) => {
                const file = fileArray.find((f) => f.name === item.file_name);
                if (!file) return;
                const put = await fetch(item.presigned_url, {
                  method: 'PUT',
                  body: file,
                });
                if (!put.ok) throw new Error('Upload failed');
                completed += 1;
                setUploadProgress(Math.round((completed / items.length) * 100));
              },
            ),
          );

          toast.success('Upload images successfully');
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Upload error';
          toast.error(msg);
        } finally {
          setIsUploading(false);
          event.target.value = '';
        }
      })();
    }
  };

  return (
    <>
      {/* Upload Progress */}
      <UploadProgress isUploading={isUploading} progress={uploadProgress} />

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
        <FolderSidebar
          folders={initialFolders}
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

        {/* Main Content */}
        <MediaContent
          files={filteredFiles}
          folders={localFolders}
          selectedFolder={selectedFolder}
          viewMode={viewMode}
          onFolderOpen={setSelectedFolder}
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
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 text-sm border rounded"
                onClick={() => {
                  setIsNewFolderOpen(false);
                  setNewFolderName('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 text-sm rounded bg-primary text-primary-foreground"
                onClick={() => {
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
                }}
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
