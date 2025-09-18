'use client';

// import { useGetChatGameVersionList } from '@/queries/useChat';
import {
  SandboxCodeEditor,
  SandboxFileExplorer,
  SandboxLayout,
  SandboxProvider,
} from '@/components/ui/shadcn-io/sandbox';
import { useGetChatGameVersionList } from '@/queries/useChat';
import { useSandpack } from '@codesandbox/sandpack-react';
import {
  ArrowDownToLine,
  ChevronRight,
  CodeXml,
  Eye,
  MessageSquare,
} from 'lucide-react';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import Copy from '../../../../../public/icon/copy';
import FileTerminal from '../../../../../public/icon/file-terminal';
import FullScreen from '../../../../../public/icon/full-screen';
import GamePreview from '../../../../../public/image/game-image-preview.png';

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

  console.log('data game version', chatGameVersionList);
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
  const codeLines = [
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
  ];

  // Files for Sandbox File Explorer UI
  const sandboxFiles = {
    '/App/page.tsx': {
      code: codeLines.join('\n'),
    },
    '/Components/Background.tsx': {
      code: 'export const Background = () => <div />;\n',
    },
    '/Components/Collision.tsx': {
      code: 'export const Collision = () => null;\n',
    },
  } as const;

  const SandpackBreadcrumb: FC = () => {
    const { sandpack } = useSandpack();
    const activePath = sandpack?.activeFile || '/App/page.tsx';
    const parts = activePath.replace(/^\//, '').split('/');
    const root = parts[0] || 'App';
    const file = parts.slice(1).join('/') || 'page.tsx';
    return (
      <div className="pt-2 bg-white text-paragraph flex items-center gap-1">
        <span className="font-medium !text-[#272727]/50">{root}</span>
        {/* <span className="px-1 !text-[#272727]/50">›</span> */}
        <ChevronRight className="w-4 h-4 stroke-[#272727]/50" />
        <span className="font-medium">{file}</span>
      </div>
    );
  };

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
              className="bg-[#272727]/5 flex items-center gap-1.5 rounded-lg p-2 text-paragraph cursor-pointer"
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
      {activeView === 'view' ? (
        <div className="flex-1 overflow-y-auto px-10">
          <Image
            src={GamePreview}
            alt="Game Preview Image"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="flex-1 h-full">
          <SandboxProvider
            template="react"
            files={sandboxFiles}
            theme="light"
            className="h-full border-none"
          >
            <div className="flex gap-1 h-full">
              {/* File explorer using Sandbox */}
              <div className=" bg-white overflow-hidden h-full">
                <div className="h-full">
                  <SandboxLayout className="!h-full">
                    <SandboxFileExplorer className="!border-none !h-full" />
                  </SandboxLayout>
                </div>
              </div>

              {/* Editor using SandboxCodeEditor */}
              <div className="flex-1 overflow-hidden bg-white flex flex-col h-full">
                <SandpackBreadcrumb />
                <SandboxLayout className="!h-full">
                  <SandboxCodeEditor showTabs={false} showLineNumbers={true} />
                </SandboxLayout>
              </div>
            </div>
          </SandboxProvider>
        </div>
      )}
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
