'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Removed Sheet usage to support embedding in a resizable panel
import { useGetChatGameVersionList } from '@/queries/useChat';
import { Download, Eye, Play } from 'lucide-react';
import { FC, useEffect, useState } from 'react';

type ExplorePanelProps = {
  chatId: string;
  onGameSignalReceived: () => void;
  className?: string;
  messages?: Array<unknown>;
  onRequestOpen?: () => void;
};

type GameVersion = {
  id: string;
  chat_id: string;
  version: string;
  description: string;
  game_url: string;
};

export const ExplorePanel: FC<ExplorePanelProps> = ({
  chatId,
  onGameSignalReceived,
  className,
  messages,
  onRequestOpen,
}) => {
  const [isGameModalOpen, setIsGameModalOpen] = useState<boolean>(false);
  const [gameVersion, setGameVersion] = useState<GameVersion | null>(null);

  const { data: chatGameVersionList } = useGetChatGameVersionList(chatId);

  useEffect(() => {
    if (
      chatGameVersionList?.data?.data &&
      Array.isArray(chatGameVersionList?.data?.data) &&
      chatGameVersionList?.data?.data.length > 0
    ) {
      setGameVersion(chatGameVersionList?.data?.data[0] || null);
      onGameSignalReceived?.();
    } else {
      setGameVersion(null);
    }
  }, [chatGameVersionList, onGameSignalReceived]);

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
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Explore</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Game Title */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Flappy Bird Game
          </h3>
          <p className="text-sm text-muted-foreground">
            Your generated game is ready to play!
          </p>
        </div>

        {/* Game Version Selector */}
        <div className="space-y-2">
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
        </div>

        {/* Game Preview Card */}
        <div className="bg-gradient-to-br from-blue-100 to-purple-200 rounded-xl p-6 text-center space-y-4 dark:from-blue-500/10 dark:to-purple-500/10">
          {/* Game Icon */}
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
            </div>
          </div>

          {/* Game Info */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-1">
              {gameVersion?.version}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {gameVersion?.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
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
        </div>

        {/* Version Details */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Version Details</h4>
          <div className="space-y-2">
            <p className="text-sm text-foreground/80">
              Initial Flappy Bird game
            </p>
            <p className="text-sm text-muted-foreground">
              Generated 5 minutes ago
            </p>
          </div>
        </div>

        {/* Additional Games Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">More Games</h4>
          <div className="space-y-2">
            <div className="border border-border rounded-lg p-3 hover:bg-muted cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center dark:bg-emerald-500/10">
                  <div className="w-5 h-5 bg-green-600 rounded dark:bg-emerald-400"></div>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm">Snake Game</h5>
                  <p className="text-xs text-muted-foreground">
                    Classic snake game
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 hover:bg-muted cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center dark:bg-rose-500/10">
                  <div className="w-5 h-5 bg-red-600 rounded-full dark:bg-rose-400"></div>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm">Pong Game</h5>
                  <p className="text-xs text-muted-foreground">
                    Retro ping pong
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 hover:bg-muted cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center dark:bg-amber-500/10">
                  <div className="w-5 h-5 bg-yellow-600 rounded-lg dark:bg-amber-400"></div>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm">Tetris</h5>
                  <p className="text-xs text-muted-foreground">
                    Block puzzle game
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
