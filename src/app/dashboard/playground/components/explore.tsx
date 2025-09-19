'use client';

import { useFileContent } from '@/hooks/useFileContent';
import { useFolderContent } from '@/hooks/useFolderContent';
import { useGameSignalDetection } from '@/hooks/useGameSignalDetection';
import { extractS3CommonPrefixes, extractS3Contents } from '@/lib/s3';
import { processS3FilesToSandbox, selectActiveFile } from '@/lib/sandbox-utils';
import { useGetChatGameVersionList } from '@/queries/useChat';
import { useGetListFileInGameFolder } from '@/queries/useLibrary';
import type { S3ListBucketResultType } from '@/types/library';
import { ArrowDownToLine, CodeXml, Eye, MessageSquare } from 'lucide-react';
import { FC, useEffect, useMemo, useState } from 'react';
import Copy from '../../../../../public/icon/copy';
import FileTerminal from '../../../../../public/icon/file-terminal';
import FullScreen from '../../../../../public/icon/full-screen';
import { SandboxCodePanel } from './sandbox-code-panel';

type ExplorePanelProps = {
  chatId: string;
  onGameSignalReceived: () => void;
  className?: string;
  messages?: Array<unknown>;
  onRequestOpen?: () => void;
  onChatExpand?: (expanded: boolean) => void;
  isChatExpanded?: boolean;
};

// type GameVersion = {
//   id: string;
//   chat_id: string;
//   version: string;
//   description: string;
//   game_url: string;
// };

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

  // Use external state if provided, otherwise use internal state
  const isChatExpanded = externalIsChatExpanded ?? false;
  const handleChatExpand = (expanded: boolean) => {
    if (onChatExpand) {
      onChatExpand(expanded);
    }
  };

  // TEMP: hardcoded game url for build files
  const hardcodedChatId = '577ebde2-a069-4e07-b3ec-ed2d3c62de15';
  const hardcodedVersion = '7778660e-8d7c-4197-8f5d-f0e59b376561';
  const gameUrl =
    hardcodedChatId && hardcodedVersion
      ? `/builds/${hardcodedChatId}/${hardcodedVersion}`
      : '';
  const { data: gameBuildFiles } = useGetListFileInGameFolder(gameUrl);

  // File and folder content management
  const { fileContents, loadFileContent } = useFileContent();
  const { folderContents, fetchFolderContent } = useFolderContent(
    hardcodedChatId,
    hardcodedVersion,
  );

  console.log('game build files', gameBuildFiles);

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
      hardcodedChatId,
      hardcodedVersion,
      fileContents,
      folderContents,
    );
  }, [
    gameBuildFiles,
    hardcodedChatId,
    hardcodedVersion,
    fileContents,
    folderContents,
  ]);

  // Pick a sensible active file
  const activeFile = useMemo(() => {
    return selectActiveFile(sandboxFiles);
  }, [sandboxFiles]);

  // Auto-open explore when latest assistant message has game signals
  useGameSignalDetection(messages, onRequestOpen, onGameSignalReceived);

  return (
    <div className={'flex flex-col h-full ' + (className || '')}>
      {/* Header */}
      <div className="px-2 pt-1 pb-1.5 border-b border-border bg-white">
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
          {/* Right icon buttons */}
          <div className="flex items-center gap-2 text-[#272727]">
            <button type="button" className="cursor-pointer">
              <Copy className="w-3 h-3 stroke-[1px] stroke-[#272727]" />
            </button>
            <button type="button" className="cursor-pointer">
              <ArrowDownToLine className="w-3 h-3 stroke-[1px]" />
            </button>
            <button type="button" className="cursor-pointer">
              <FileTerminal className="w-3 h-3 stroke-[1px]" />
            </button>
            <button type="button" className="cursor-pointer">
              <FullScreen className="w-3 h-3 stroke-[1px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <SandboxCodePanel
          files={sandboxFiles}
          template="react"
          theme="light"
          activeView={activeView}
          activeFile={activeFile}
          minioUrl={process.env.NEXT_PUBLIC_MINIO_URL}
          gameUrl={gameUrl}
        />
      </div>
      {/* <div className="flex-1 overflow-y-auto px-10"> */}
      {/* <Image
          src={GamePreview}
          alt="Game Preview Image"
          className="w-full h-full object-cover"
        /> */}
      {/* Game Title */}
      {/* <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Flappy Bird Game
          </h3>
          <p className="text-sm text-muted-foreground">
            Your generated game is ready to play!
          </p>
        </div> */}

      {/* Game Version Selector */}
      {/* <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Game Version
          </label>
          <Select
            defaultValue="version-1.0"
            onValueChange={(value: string) => {
              setGameVersion(
                chatGameVersionList?.data?.data.find(
                  (gameVersion) => gameVersion.version === value,
                ) || null,
              );
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Version" />
            </SelectTrigger>
            <SelectContent>
              {chatGameVersionList?.data?.data?.map(
                (gameVersion: GameVersion, index: number) => (
                  <SelectItem value={gameVersion.version} key={gameVersion.id}>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-muted-foreground">
                        <div className="flex flex-col items-start">
                          <div className="font-medium text-black">
                            Version {index + 1}
                          </div>
                          {gameVersion.version}
                        </div>
                      </span>
                    </div>
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div> */}

      {/* Game Info */}
      {/* <div>
            <h4 className="text-lg font-semibold text-foreground mb-1">
              {gameVersion?.version}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {gameVersion?.description}
            </p>
          </div> */}

      {/* Action Buttons */}
      {/* <div className="space-y-3">
            {gameVersion && (
              <Dialog open={isGameModalOpen} onOpenChange={setIsGameModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Play Game
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-full h-[95vh] p-0">
                  <div className="w-full h-full px-4 py-6">
                    <div className="h-3"></div>
                    <iframe
                      src={`https://minio.buymed.site/${gameVersion?.game_url}`}
                      className="w-full h-full border-0 rounded"
                      title={gameVersion?.version}
                      allowFullScreen
                    />
                    <div className="h-4"></div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-background">
                <Eye className="w-4 h-4 mr-2" />
                View Code
              </Button>
              <Button variant="outline" className="flex-1 bg-background">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div> */}

      {/* Version Details */}
      {/* <div className="space-y-3">
          <h4 className="font-medium text-foreground">Version Details</h4>
          <div className="space-y-2">
            <p className="text-sm text-foreground/80">
              Initial Flappy Bird game
            </p>
            <p className="text-sm text-muted-foreground">
              Generated 5 minutes ago
            </p>
          </div>
        </div> */}

      {/* Additional Games Section */}
      {/* </div> */}
    </div>
  );
};
