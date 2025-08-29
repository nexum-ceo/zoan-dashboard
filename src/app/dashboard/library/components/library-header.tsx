'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Folder, Globe } from 'lucide-react';

type LibraryHeaderProps = {
  activeTab: 'library' | 'assets';
  onTabChange: (tab: 'library' | 'assets') => void;
};

export function LibraryHeader({ activeTab, onTabChange }: LibraryHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Media Library</h1>
      <p className="text-gray-600 mb-6">
        Manage your media files and assets for AI projects
      </p>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'library' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('library')}
          className={cn(
            'flex items-center gap-2',
            activeTab === 'library' && 'shadow-sm',
          )}
        >
          <Folder className="w-4 h-4" />
          My Library
        </Button>
        <Button
          variant={activeTab === 'assets' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('assets')}
          className={cn(
            'flex items-center gap-2',
            activeTab === 'assets' && 'shadow-sm',
          )}
        >
          <Globe className="w-4 h-4" />
          Public Assets
        </Button>
      </div>
    </div>
  );
}
