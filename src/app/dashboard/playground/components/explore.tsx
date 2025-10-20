'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useGetChatGameVersionList } from '@/hooks/data/chat';
import { useGetListFileInGameFolder } from '@/hooks/data/library';
import { useFileContent } from '@/hooks/system';
import { useFolderContent } from '@/hooks/system/useFolderContent';
import { useGameSignalDetection } from '@/hooks/system/useGameSignalDetection';
import { downloadSandboxZip } from '@/lib/download-utils';
import { extractS3CommonPrefixes, extractS3Contents } from '@/lib/s3';
import { processS3FilesToSandbox, selectActiveFile } from '@/lib/sandbox-utils';
import type { S3ListBucketResultType } from '@/types/library';
import { ArrowDownToLine, CodeXml, Eye, MessageSquare } from 'lucide-react';
import { FC, useEffect, useMemo, useState } from 'react';
import Close from '../../../../../public/icon/close';
import Copy from '../../../../../public/icon/copy';
import FileTerminal from '../../../../../public/icon/file-terminal';
import FullScreen from '../../../../../public/icon/full-screen';
import { SandboxCodePanel } from './sandbox-code-panel';

type ExplorePanelProps = {
  chatId: string;
  onGameSignalReceived?: () => void;
  className?: string;
  messages?: Array<unknown>;
  onRequestOpen?: () => void;
  onChatExpand?: (expanded: boolean) => void;
  isChatExpanded?: boolean;
};

export const ExplorePanel: FC<ExplorePanelProps> = ({
  chatId,
  onGameSignalReceived,
  className,
  messages,
  onRequestOpen,
  onChatExpand,
  isChatExpanded: externalIsChatExpanded,
}) => {
  // --- Logic fetch game version list ---
  const { data: chatGameVersionList } = useGetChatGameVersionList(chatId);
  const [activeView, setActiveView] = useState<'code' | 'view'>('code');
  const [selectedVersionId, setSelectedVersionId] = useState<
    string | undefined
  >(undefined);

  // Derive version options and presence
  const versionOptions = useMemo(
    () => chatGameVersionList?.data?.data ?? [],
    [chatGameVersionList],
  );
  const sortedVersionOptions = useMemo(() => {
    return [...versionOptions].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return aTime - bTime; // oldest first => v1 is oldest
    });
  }, [versionOptions]);
  const hasVersions = sortedVersionOptions.length > 0;

  // Auto-pick first version when data arrives if none selected
  useEffect(() => {
    if (!selectedVersionId && hasVersions) {
      setSelectedVersionId(sortedVersionOptions[0].id);
    }
  }, [hasVersions, sortedVersionOptions, selectedVersionId]);

  // Selected version object based on current selection (fallback to first)
  const selectedVersion = useMemo(() => {
    if (!hasVersions) return undefined;
    const found = sortedVersionOptions.find((v) => v.id === selectedVersionId);
    return found ?? sortedVersionOptions[0];
  }, [sortedVersionOptions, selectedVersionId, hasVersions]);

  // Extract chatId/version from game_url like: games/{chatId}/{version}/...
  const extractedIds = useMemo(() => {
    const path = (selectedVersion?.game_url || '').replace(/^\/+/, '');
    const match = path.match(/^games\/([^/]+)\/([^/]+)/);
    if (match) {
      return { chatId: match[1], version: match[2] } as const;
    }
    if (selectedVersion?.chat_id && selectedVersion?.id) {
      return {
        chatId: selectedVersion.chat_id,
        version: selectedVersion.id,
      } as const;
    }
    return undefined;
  }, [selectedVersion]);

  // Use external state if provided, otherwise use internal state
  const isChatExpanded = externalIsChatExpanded ?? false;
  const handleChatExpand = (expanded: boolean) => {
    if (onChatExpand) {
      onChatExpand(expanded);
    }
  };

  // Build API path for listing files based on extracted chatId/version
  const buildsApiPath = useMemo(() => {
    if (!extractedIds) return '';
    return `/games/${extractedIds.chatId}/${extractedIds.version}`;
  }, [extractedIds]);

  const { data: gameBuildFiles } = useGetListFileInGameFolder(buildsApiPath);

  // File and folder content management
  const { fileContents, loadFileContent } = useFileContent();
  const { folderContents, fetchFolderContent } = useFolderContent(
    extractedIds?.chatId ?? '',
    extractedIds?.version ?? '',
  );

  // Debug: Log extracted contents and folders
  useEffect(() => {
    if (gameBuildFiles) {
      const folders = extractS3CommonPrefixes(
        gameBuildFiles as S3ListBucketResultType,
      );

      // Fetch content from each folder
      folders.forEach((folder) => {
        const folderName = folder.folderName;
        if (!folderContents[folderName]) {
          fetchFolderContent(folderName);
        }
      });
    }
  }, [gameBuildFiles, folderContents, fetchFolderContent]);

  // Fetch file contents when files are detected
  useEffect(() => {
    if (gameBuildFiles) {
      const contents = extractS3Contents(
        gameBuildFiles as S3ListBucketResultType,
      );

      // Fetch content for files in current directory
      contents
        .filter(
          (item) => typeof item.key === 'string' && !item.key.endsWith('/'),
        )
        .forEach(async (item) => {
          const fileKey = item.key;
          if (!fileContents[fileKey]) {
            await loadFileContent(fileKey);
          }
        });

      // Fetch content for files in subfolders
      Object.entries(folderContents).forEach(([, folderData]) => {
        if (folderData) {
          const folderFiles = extractS3Contents(folderData);
          folderFiles
            .filter(
              (item) => typeof item.key === 'string' && !item.key.endsWith('/'),
            )
            .forEach(async (item) => {
              const fileKey = item.key;
              if (!fileContents[fileKey]) {
                await loadFileContent(fileKey);
              }
            });
        }
      });
    }
  }, [gameBuildFiles, folderContents, fileContents, loadFileContent]);

  useEffect(() => {
    if (
      chatGameVersionList?.data?.data &&
      Array.isArray(chatGameVersionList?.data?.data) &&
      chatGameVersionList?.data?.data.length > 0
    ) {
      onGameSignalReceived?.();
    }
  }, [chatGameVersionList, onGameSignalReceived]);

  // Build Sandpack files map from S3 listing
  const sandboxFiles = useMemo(() => {
    return processS3FilesToSandbox(
      gameBuildFiles as S3ListBucketResultType | undefined,
      extractedIds?.chatId ?? '',
      extractedIds?.version ?? '',
      fileContents,
      folderContents,
    );
  }, [
    gameBuildFiles,
    extractedIds?.chatId,
    extractedIds?.version,
    fileContents,
    folderContents,
  ]);

  // Pick a sensible active file
  const activeFile = useMemo(() => {
    return selectActiveFile(sandboxFiles);
  }, [sandboxFiles]);

  // Auto-open explore when latest assistant message has game signals
  useGameSignalDetection(messages, onRequestOpen, onGameSignalReceived);

  // Fullscreen preview state
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Build iframe URL for fullscreen preview
  const iframeUrl = useMemo(() => {
    const rawBase = process.env.NEXT_PUBLIC_MINIO_URL || '';
    const base = rawBase.replace(/\/+$/, '');
    const previewPath = (selectedVersion?.game_url || '').replace(/^\/+/, '');
    return base && previewPath ? `${base}/${previewPath}` : '';
  }, [selectedVersion]);

  // Close on ESC when fullscreen is open
  useEffect(() => {
    if (!isFullscreenOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreenOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreenOpen]);

  return (
    <div
      className={`rounded-xl flex flex-col h-full transition-all duration-300 ease-in-out ${
        className || ''
      }`}
    >
      {/* Header */}
      <div className="px-2 pt-1 pb-1.5 border-b border-border bg-white flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Left segmented controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleChatExpand(!isChatExpanded)}
              className="bg-[#272727]/5 flex items-center gap-1 rounded-lg px-2 py-1 text-paragraph cursor-pointer"
            >
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full">
                <MessageSquare className="w-4 h-4" />
              </span>
              Chat
            </button>

            {/** Code and View toggle buttons */}
            <div className="flex items-center gap-1 bg-[#272727]/5 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setActiveView('code')}
                className={`cursor-pointer flex items-center gap-2 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  activeView === 'code' ? 'bg-primary-brand-green' : ''
                }`}
              >
                <CodeXml
                  className={`w-4 h-4 transition-colors duration-200 ease-in-out ${
                    activeView === 'code' ? 'stroke-[#608234]' : ''
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setActiveView('view')}
                className={`cursor-pointer flex items-center gap-2 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  activeView === 'view' ? 'bg-primary-brand-green' : ''
                }`}
              >
                <Eye
                  className={`w-4 h-4 transition-colors duration-200 ease-in-out ${
                    activeView === 'view' ? 'stroke-[#608234]' : ''
                  }`}
                />
              </button>
            </div>
          </div>
          {/* Right controls */}
          <div className="flex items-center gap-2 text-[#272727]">
            {hasVersions && (
              <Select
                value={selectedVersionId}
                onValueChange={(v) => setSelectedVersionId(v)}
              >
                <SelectTrigger
                  size="sm"
                  className="!h-6 px-2 py-0.5 text-paragraph"
                >
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {sortedVersionOptions.map((v, idx) => (
                    <SelectItem
                      key={v.id}
                      value={v.id}
                      className="text-paragraph"
                    >
                      {`v${idx + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <button type="button" className="cursor-pointer">
              <Copy className="w-3 h-3 stroke-[1px] stroke-[#272727]" />
            </button>
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => {
                const timestamp = new Date()
                  .toISOString()
                  .replace(/[:.]/g, '-');
                const name = `build-${extractedIds?.chatId ?? 'unknown'}-${
                  extractedIds?.version ?? 'unknown'
                }-${timestamp}`;
                downloadSandboxZip(sandboxFiles, name);
              }}
            >
              <ArrowDownToLine className="w-3 h-3 stroke-[1px]" />
            </button>
            <button type="button" className="cursor-pointer">
              <FileTerminal className="w-3 h-3 stroke-[1px]" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeView === 'view') {
                  setIsFullscreenOpen(true);
                }
              }}
              className="cursor-pointer"
            >
              <FullScreen className="w-3 h-3 stroke-[1px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 transition-all duration-300 ease-in-out overflow-hidden">
        <SandboxCodePanel
          files={sandboxFiles}
          template="react"
          theme="light"
          activeView={activeView}
          activeFile={activeFile}
          minioUrl={process.env.NEXT_PUBLIC_MINIO_URL}
          gameUrl={
            extractedIds
              ? `/games/${extractedIds.chatId}/${extractedIds.version}`
              : ''
          }
        />
      </div>

      {/* Fullscreen preview overlay */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-end px-4 py-2 border-b border-border">
            <button
              type="button"
              aria-label="Exit fullscreen"
              onClick={() => setIsFullscreenOpen(false)}
              className="cursor-pointer"
            >
              <Close />
            </button>
          </div>
          <div className="flex-1">
            {iframeUrl ? (
              <iframe
                src={iframeUrl}
                className="w-full h-full border-0"
                title="Game Preview Fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No preview available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
