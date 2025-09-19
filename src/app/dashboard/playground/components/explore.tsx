'use client';

// import { useGetChatGameVersionList } from '@/queries/useChat';
import { extractS3CommonPrefixes, extractS3Contents } from '@/lib/s3';
import { useGetChatGameVersionList } from '@/queries/useChat';
import { useGetListFileInGameFolder } from '@/queries/useLibrary';
import type { S3ListBucketResultType } from '@/types/library';
import { ArrowDownToLine, CodeXml, Eye, MessageSquare } from 'lucide-react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
}) => {
  // --- Logic fetch game version list ---
  const { data: chatGameVersionList } = useGetChatGameVersionList(chatId);
  const [activeView, setActiveView] = useState<'code' | 'view'>('code');

  // TEMP: hardcoded game url for build files
  const hardcodedChatId = '577ebde2-a069-4e07-b3ec-ed2d3c62de15';
  const hardcodedVersion = '7778660e-8d7c-4197-8f5d-f0e59b376561';
  const gameUrl =
    hardcodedChatId && hardcodedVersion
      ? `/builds/${hardcodedChatId}/${hardcodedVersion}`
      : '';
  const { data: gameBuildFiles } = useGetListFileInGameFolder(gameUrl);
  const [folderContents, setFolderContents] = useState<
    Record<string, S3ListBucketResultType>
  >({});
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  console.log('game build files', gameBuildFiles);

  // Function to fetch actual file content from MinIO
  const fetchFileContent = useCallback(
    async (fileKey: string): Promise<string> => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || '';
        const fileUrl = `${baseUrl}/builds/${fileKey}`;
        const response = await fetch(fileUrl);

        if (response.ok) {
          const content = await response.text();
          console.log(
            `Fetched content for file ${fileKey}:`,
            content.substring(0, 100) + '...',
          );
          return content;
        } else {
          console.warn(
            `Failed to fetch content for file ${fileKey}:`,
            response.status,
          );
          return `// Error: Could not fetch content for ${fileKey}\n// Status: ${response.status}`;
        }
      } catch (error) {
        console.error(`Error fetching content for file ${fileKey}:`, error);
        return `// Error: Could not fetch content for ${fileKey}\n// Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
      }
    },
    [],
  );

  // Function to fetch content from a specific folder
  const fetchFolderContent = useCallback(
    async (folderName: string) => {
      if (folderContents[folderName]) return; // Already fetched

      try {
        const response = await fetch(
          `/api/builds/${hardcodedChatId}/${hardcodedVersion}/${folderName}`,
        );
        if (response.ok) {
          const data = await response.json();
          setFolderContents((prev) => ({
            ...prev,
            [folderName]: data,
          }));
          console.log(`Fetched content for folder ${folderName}:`, data);
        }
      } catch (error) {
        console.error(
          `Error fetching content for folder ${folderName}:`,
          error,
        );
      }
    },
    [folderContents, hardcodedChatId, hardcodedVersion],
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

  // Effect to fetch file contents when files are detected
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
            const content = await fetchFileContent(fileKey);
            setFileContents((prev) => ({
              ...prev,
              [fileKey]: content,
            }));
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
                const content = await fetchFileContent(fileKey);
                setFileContents((prev) => ({
                  ...prev,
                  [fileKey]: content,
                }));
              }
            });
        }
      });
    }
  }, [gameBuildFiles, folderContents, fileContents, fetchFileContent]);
  useEffect(() => {
    if (
      chatGameVersionList?.data?.data &&
      Array.isArray(chatGameVersionList?.data?.data) &&
      chatGameVersionList?.data?.data.length > 0
    ) {
      onGameSignalReceived?.();
    }
  }, [chatGameVersionList, onGameSignalReceived]);

  // Static code content for preview UI
  const codeLines = useMemo(
    () => [
      '// Imports',
      "import mongoose, { Schema } from 'mongoose'",
      '',
      '// Collection name',
      "export const collection = 'Product'",
      '',
      '// Schema',
      'const schema = new Schema({',
      '  name: {',
      '    type: String,',
      '    required: true',
      '  },',
      '',
      '  description: {',
      '    type: String',
      '  }',
      '}, { timestamps: true })',
      '',
      '// Model',
      'export default mongoose.model(collection, schema, collection)',
    ],
    [],
  );

  // Build Sandpack files map from S3 listing + default sample files
  const sandboxFiles = useMemo(() => {
    const defaults: Record<string, { code: string }> = {
      '/App/page.tsx': {
        code: codeLines.join('\n'),
      },
      '/Components/Background.tsx': {
        code: 'export const Background = () => <div />;\n',
      },
      '/Components/Collision.tsx': {
        code: 'export const Collision = () => null;\n',
      },
    };

    const s3 = gameBuildFiles as S3ListBucketResultType | undefined;
    if (!s3) return defaults;

    const contents = extractS3Contents(s3);
    const folders = extractS3CommonPrefixes(s3);

    console.log('Processing files:', contents.length);
    console.log('Processing folders:', folders.length);

    // strip `${chatId}/${version}/` prefix
    const prefix = `${hardcodedChatId}/${hardcodedVersion}/`;
    const filesFromS3: Record<string, { code: string }> = {};
    const textExtensions = [
      'js',
      'ts',
      'tsx',
      'jsx',
      'json',
      'css',
      'html',
      'md',
    ];

    // Process files in current directory
    contents
      .filter((item) => typeof item.key === 'string' && !item.key.endsWith('/'))
      .forEach((item) => {
        const rel = item.key.startsWith(prefix)
          ? item.key.slice(prefix.length)
          : item.key;
        const path = `/${rel}`;
        const ext = (rel.split('.').pop() || '').toLowerCase();
        if (!textExtensions.includes(ext)) {
          return; // skip non-text files at initial map
        }
        // Check if we already have content for this file
        const fileKey = item.key;
        let content = fileContents[fileKey];

        if (!content) {
          // For package.json, create a default if not found, but still try to fetch real content
          if (rel.toLowerCase() === 'package.json') {
            content = JSON.stringify(
              {
                name: 'sandbox-app',
                version: '0.1.0',
                private: true,
                dependencies: {},
              },
              null,
              2,
            );
          } else {
            content = `// Loading content for ${rel}...\n// File: ${rel}\n// Key: ${fileKey}\n// Size: ${item.size} bytes\n// Last Modified: ${item.lastModified}\n\n// This content will be loaded from MinIO\nconsole.log('Loading ${rel}...');`;
          }
        }

        filesFromS3[path] = { code: content };
      });

    // Process folders - create placeholder files for each folder
    folders.forEach((folder) => {
      const folderName = folder.folderName;
      const folderPath = `/${folderName}`;

      // Check if we have content for this folder
      const folderContent = folderContents[folderName];

      if (folderContent) {
        // Use actual content from folder
        const folderFiles = extractS3Contents(folderContent);

        folderFiles
          .filter(
            (item) => typeof item.key === 'string' && !item.key.endsWith('/'),
          )
          .forEach((item) => {
            const rel = item.key.startsWith(folder.prefix)
              ? item.key.slice(folder.prefix.length)
              : item.key;
            const path = `/${folderName}/${rel}`;
            const ext = (rel.split('.').pop() || '').toLowerCase();

            if (textExtensions.includes(ext)) {
              const fileKey = item.key;
              const content =
                fileContents[fileKey] ||
                `// Loading content for ${rel}...\n// File: ${rel} (from ${folderName} folder)\n// Key: ${fileKey}\n// Size: ${item.size} bytes\n// Last Modified: ${item.lastModified}\n\n// This content will be loaded from MinIO\nconsole.log('Loading ${folderName}/${rel}...');`;

              filesFromS3[path] = { code: content };
            }
          });
      } else {
        // Create a placeholder index file for each folder
        filesFromS3[`${folderPath}/index.js`] = {
          code: `// Folder: ${folderName}
// This folder contains files from the game build
// Folder prefix: ${folder.prefix}

console.log('Welcome to ${folderName} folder');

// TODO: Load  files from this folder
export default {
  folderName: '${folderName}',
  prefix: '${folder.prefix}',
  note: 'This is a placeholder for folder content'
};`,
        };
      }
    });

    const result = { ...defaults, ...filesFromS3 };
    console.log('sandboxFiles created:', result);
    return result;
  }, [
    gameBuildFiles,
    codeLines,
    hardcodedChatId,
    hardcodedVersion,
    folderContents,
    fileContents,
  ]);

  // Build a folder tree from S3 contents for display/other uses
  type TreeNode = {
    name: string;
    path: string;
    type: 'folder' | 'file';
    children?: TreeNode[];
  };

  const folderTree = useMemo<TreeNode | null>(() => {
    const s3 = gameBuildFiles as S3ListBucketResultType | undefined;
    if (!s3) return null;

    const contents = extractS3Contents(s3);
    const folders = extractS3CommonPrefixes(s3);

    if (!contents.length && !folders.length) {
      return { name: '/', path: '/', type: 'folder', children: [] };
    }

    const prefix = `${hardcodedChatId}/${hardcodedVersion}/`;
    const root: TreeNode = {
      name: '/',
      path: '/',
      type: 'folder',
      children: [],
    };

    const ensureFolder = (parent: TreeNode, folderName: string): TreeNode => {
      parent.children = parent.children || [];
      const existing = parent.children.find(
        (c) => c.type === 'folder' && c.name === folderName,
      );
      if (existing) return existing;
      const node: TreeNode = {
        name: folderName,
        path:
          parent.path === '/'
            ? `/${folderName}`
            : `${parent.path}/${folderName}`,
        type: 'folder',
        children: [],
      };
      parent.children.push(node);
      return node;
    };

    const addFile = (parent: TreeNode, fileName: string, fullPath: string) => {
      parent.children = parent.children || [];
      parent.children.push({ name: fileName, path: fullPath, type: 'file' });
    };

    // Add folders first
    folders.forEach((folder) => {
      const folderName = folder.folderName;
      ensureFolder(root, folderName);
    });

    // Add files in current directory
    contents
      .filter((item) => typeof item.key === 'string' && !item.key.endsWith('/'))
      .forEach((item) => {
        const rel = item.key.startsWith(prefix)
          ? item.key.slice(prefix.length)
          : item.key;
        const parts = rel.split('/').filter(Boolean);
        let cursor = root;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const isLast = i === parts.length - 1;
          if (isLast) {
            const fullPath = `/${rel}`;
            addFile(cursor, part, fullPath);
          } else {
            cursor = ensureFolder(cursor, part);
          }
        }
      });

    // Add files from subfolders if we have their content
    Object.entries(folderContents).forEach(([folderName, folderData]) => {
      if (folderData) {
        const folderFiles = extractS3Contents(folderData);
        const folderNode = root.children?.find(
          (child) => child.type === 'folder' && child.name === folderName,
        );

        if (folderNode) {
          folderFiles
            .filter(
              (item) => typeof item.key === 'string' && !item.key.endsWith('/'),
            )
            .forEach((item) => {
              const rel = item.key.startsWith(`${prefix}${folderName}/`)
                ? item.key.slice(`${prefix}${folderName}/`.length)
                : item.key;
              const fullPath = `/${folderName}/${rel}`;
              addFile(folderNode, rel, fullPath);
            });
        }
      }
    });

    return root;
  }, [gameBuildFiles, hardcodedChatId, hardcodedVersion, folderContents]);

  useEffect(() => {
    if (folderTree) {
      console.log('folder tree', folderTree);
    }
  }, [folderTree]);

  // pick a sensible active file
  const activeFile = useMemo(() => {
    // First try to find files from game build
    const gameFiles = Object.keys(sandboxFiles).filter(
      (key) =>
        key !== '/App/page.tsx' &&
        key !== '/Components/Background.tsx' &&
        key !== '/Components/Collision.tsx',
    );

    if (gameFiles.length > 0) {
      // Prefer index files
      const indexFiles = gameFiles.filter(
        (key) => key.includes('index') || key.includes('main'),
      );
      if (indexFiles.length > 0) {
        return indexFiles[0];
      }
      // Otherwise return first game file
      return gameFiles[0];
    }

    // Fallback to default candidates
    const candidates = [
      '/index.html',
      '/src/main.tsx',
      '/src/main.jsx',
      '/src/index.tsx',
      '/src/index.jsx',
      '/App/page.tsx',
    ];
    for (const c of candidates) {
      if (sandboxFiles[c]) return c;
    }
    // fallback to first key
    const fallback = Object.keys(sandboxFiles)[0] || '/App/page.tsx';
    console.log('Selected activeFile:', fallback);
    return fallback;
  }, [sandboxFiles]);

  // Auto-open explore when latest assistant message has game signals
  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0) return;
    const latestWithMetadata = [...(messages as Array<Record<string, unknown>>)]
      .reverse()
      .find((m) => {
        const role = m?.role as string | undefined;
        const isAssistant = role === 'assistant' || role === 'ASSISTANT';
        const metadata = (m as Record<string, unknown>)?.metadata as
          | Record<string, unknown>
          | undefined;
        const parts = (m as Record<string, unknown>)?.parts as
          | Array<{ type?: string; text?: string }>
          | undefined;
        const hasGameGeneratorMeta =
          !!metadata &&
          typeof metadata === 'object' &&
          ((metadata as Record<string, unknown>)['game_generator'] !==
            undefined ||
            (metadata as Record<string, unknown>)['game-signal'] !== undefined);
        const hasGameGeneratorPart = Array.isArray(parts)
          ? parts.some(
              (p) => p?.type === 'game_generator' || p?.type === 'game-signal',
            )
          : false;
        return isAssistant && (hasGameGeneratorMeta || hasGameGeneratorPart);
      });
    if (latestWithMetadata) {
      onRequestOpen?.();
      onGameSignalReceived?.();
    }
  }, [messages, onRequestOpen, onGameSignalReceived]);

  return (
    <div className={'flex flex-col h-full ' + (className || '')}>
      {/* Header */}
      <div className="px-2 pt-1 pb-1.5 border-b border-border bg-white">
        <div className="flex items-center justify-between gap-3">
          {/* Left segmented controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
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
                className={`flex items-center gap-2 rounded-full p-1 transition-colors duration-200 ease-in-out ${
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
                className={`flex items-center gap-2 rounded-full p-1 transition-colors duration-200 ease-in-out ${
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
            <button type="button">
              <Copy className="w-3 h-3 stroke-[1px] stroke-[#272727]" />
            </button>
            <button type="button">
              <ArrowDownToLine className="w-3 h-3 stroke-[1px]" />
            </button>
            <button type="button">
              <FileTerminal className="w-3 h-3 stroke-[1px]" />
            </button>
            <button type="button">
              <FullScreen className="w-3 h-3 stroke-[1px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <SandboxCodePanel
        files={sandboxFiles}
        template="react"
        theme="light"
        activeView={activeView}
        activeFile={activeFile}
      />
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
