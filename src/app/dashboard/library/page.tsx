import { LibraryClient } from './components/library-client';
import { LibraryHeader } from './components/library-header';
import { folders, mediaFiles } from './lib/data';

export default function LibraryPage() {
  return (
    <div className="flex-1 flex flex-col p-10 w-full h-full min-h-0">
      <LibraryHeader />
      <LibraryClient initialFolders={folders} initialFiles={mediaFiles} />
    </div>
  );
}
