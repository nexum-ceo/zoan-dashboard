'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { LibraryClient } from './components/library-client';
import { LibraryHeader } from './components/library-header';

export default function LibraryPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'library' | 'assets'>('library');

  if (!session?.user?.id) return null;

  return (
    <div className="flex-1 flex flex-col p-10 w-full h-full min-h-0 overflow-hidden">
      <LibraryHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <LibraryClient userId={session.user.id} activeTab={activeTab} />
    </div>
  );
}
