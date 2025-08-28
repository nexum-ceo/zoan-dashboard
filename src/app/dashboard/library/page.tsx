'use client';

import { useSession } from 'next-auth/react';
import { LibraryClient } from './components/library-client';
import { LibraryHeader } from './components/library-header';
import { folders, mediaFiles } from './lib/data';

export default function LibraryPage() {
  const { data: session } = useSession();
  if (!session?.user?.id) return null;

  return (
    <div className="flex-1 flex flex-col p-10 w-full h-full min-h-0 overflow-hidden">
      <LibraryHeader />
      <LibraryClient
        initialFolders={folders}
        initialFiles={mediaFiles}
        userId={session.user.id}
      />
    </div>
  );
}
