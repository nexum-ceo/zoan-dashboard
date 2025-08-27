'use client';

import { LibraryClient } from './components/library-client';
import { LibraryHeader } from './components/library-header';
import { folders, mediaFiles } from './lib/data';

export default function LibraryPage() {
  // TODO: Get actual userId from session/context
  const userId = 'df23285e-75a8-4b71-8549-01972084fa7d'; // Mock userId for now

  return (
    <div className="flex-1 flex flex-col p-10 w-full h-full min-h-0 overflow-hidden">
      <LibraryHeader />
      <LibraryClient
        initialFolders={folders}
        initialFiles={mediaFiles}
        userId={userId}
      />
    </div>
  );
}
