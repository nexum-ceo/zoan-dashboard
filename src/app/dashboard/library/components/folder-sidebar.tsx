'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from 'lucide-react';

import type { MediaFolder } from '../lib/data';

interface FolderSidebarProps {
  folders: MediaFolder[];
  selectedFolder: string;
  onFolderSelect: (folderId: string) => void;
  folderSearchQuery: string;
  onFolderSearchChange: (query: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  expandedFolders: string[];
  onToggleFolderExpansion: (folderId: string) => void;
}

export function FolderSidebar({
  folders,
  selectedFolder,
  onFolderSelect,
  folderSearchQuery,
  onFolderSearchChange,
  isCollapsed,
  onToggleCollapse,
  expandedFolders,
  onToggleFolderExpansion,
}: FolderSidebarProps) {
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(folderSearchQuery.toLowerCase()),
  );

  const renderFolder = (folder: MediaFolder, level = 0) => {
    const hasChildren = filteredFolders.some((f) => f.parentId === folder.id);
    const isExpanded = expandedFolders.includes(folder.id);
    const children = filteredFolders.filter((f) => f.parentId === folder.id);

    return (
      <div key={folder.id}>
        <Button
          variant={selectedFolder === folder.id ? 'default' : 'ghost'}
          className={`w-full justify-start gap-2 h-auto p-2 text-left ${
            level > 0 && !isCollapsed ? 'ml-4' : ''
          } ${isCollapsed ? 'justify-center' : ''}`}
          onClick={() => onFolderSelect(folder.id)}
        >
          <div
            className={`flex items-center gap-2 flex-1 min-w-0 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {hasChildren && !isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFolderExpansion(folder.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
            )}
            {!hasChildren && level > 0 && !isCollapsed && (
              <div className="w-4" />
            )}

            {folder.id === 'all' ? (
              <div title={isCollapsed ? folder.name : undefined}>
                <Folder className="w-4 h-4 text-blue-500" />
              </div>
            ) : folder.id === 'recent' ? (
              <div title={isCollapsed ? folder.name : undefined}>
                <FolderOpen className="w-4 h-4 text-green-500" />
              </div>
            ) : (
              <div title={isCollapsed ? folder.name : undefined}>
                <Folder className={`w-4 h-4 text-${folder.color}-500`} />
              </div>
            )}

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {folder.name}
                </div>
                <div className="text-xs text-gray-500">
                  {folder.fileCount} files
                </div>
              </div>
            )}

            {!isCollapsed && folder.id !== 'all' && folder.id !== 'recent' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle folder options
                }}
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            )}
          </div>
        </Button>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-2">
            {children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = filteredFolders.filter((folder) => !folder.parentId);

  return (
    <div
      className={`transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      } flex flex-col h-full overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4">
        {!isCollapsed && (
          <h3 className="font-medium text-sm text-gray-700">Folders</h3>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="relative mb-4">
          <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search folders..."
            value={folderSearchQuery}
            onChange={(e) => onFolderSearchChange(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
      )}

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {rootFolders.map((folder) => renderFolder(folder))}
          </div>
        </ScrollArea>
      </div>

      {/* Compact Storage Usage */}
      {!isCollapsed && (
        <Card className="mt-4">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Storage</span>
                <span>45.2 MB / 1 GB</span>
              </div>
              <Progress value={4.5} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
