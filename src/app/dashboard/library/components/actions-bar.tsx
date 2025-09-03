'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Filter,
  FolderPlus,
  Grid3X3,
  List,
  Search,
  SortAsc,
  Upload,
} from 'lucide-react';
import { FC } from 'react';

type ActionsBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUpload: () => void;
  onNewFolder: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  readOnly?: boolean;
};

export const ActionsBar: FC<ActionsBarProps> = ({
  searchQuery,
  onSearchChange,
  onUpload,
  onNewFolder,
  viewMode,
  onViewModeChange,
  readOnly,
}) => {
  return (
    <div
      className={`flex items-center ${
        readOnly ? 'justify-end' : 'justify-between'
      } mb-6`}
    >
      {!readOnly && (
        <div className="flex items-center gap-4">
          <Button onClick={onUpload} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={onNewFolder}
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        {!readOnly && (
          <>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <SortAsc className="w-4 h-4" />
            </Button>
          </>
        )}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-l-none"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
