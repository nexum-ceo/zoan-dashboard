'use client';

import { useLibrary } from '@/queries/useLibrary';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { MediaFile, MediaFolder } from '../lib/data';
import { ActionsBar } from './actions-bar';
import { FolderSidebar } from './folder-sidebar';
import { MediaContent } from './media-content';
import { UploadProgress } from './upload-progress';

interface LibraryClientProps {
  initialFolders: MediaFolder[];
  initialFiles: MediaFile[];
}

export function LibraryClient({
  initialFolders,
  initialFiles,
}: LibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFolderPanelCollapsed, setIsFolderPanelCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([
    'game-assets',
    'ui-elements',
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          folders={initialFolders}
          selectedFolder={selectedFolder}
          viewMode={viewMode}
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
    </>
  );
}
