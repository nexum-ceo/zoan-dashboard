export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document' | 'archive';
  size: number;
  uploadDate: Date;
  folder: string;
  url: string;
  thumbnail?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  usedInProjects?: string[];
}

export interface MediaFolder {
  id: string;
  name: string;
  fileCount: number;
  size: number;
  color: string;
  parentId?: string;
  isExpanded?: boolean;
}

export const folders: MediaFolder[] = [
  { id: 'all', name: 'All Files', fileCount: 24, size: 45.2, color: 'blue' },
  { id: 'recent', name: 'Recent', fileCount: 8, size: 12.1, color: 'green' },
  {
    id: 'game-assets',
    name: 'Game Assets',
    fileCount: 12,
    size: 23.1,
    color: 'purple',
    isExpanded: true,
  },
  {
    id: 'sprites',
    name: 'Sprites',
    fileCount: 6,
    size: 8.4,
    color: 'purple',
    parentId: 'game-assets',
  },
  {
    id: 'backgrounds',
    name: 'Backgrounds',
    fileCount: 4,
    size: 12.2,
    color: 'purple',
    parentId: 'game-assets',
  },
  {
    id: 'effects',
    name: 'Effects',
    fileCount: 2,
    size: 2.5,
    color: 'purple',
    parentId: 'game-assets',
  },
  {
    id: 'ui-elements',
    name: 'UI Elements',
    fileCount: 8,
    size: 12.4,
    color: 'green',
    isExpanded: true,
  },
  {
    id: 'buttons',
    name: 'Buttons',
    fileCount: 4,
    size: 3.2,
    color: 'green',
    parentId: 'ui-elements',
  },
  {
    id: 'icons',
    name: 'Icons',
    fileCount: 4,
    size: 9.2,
    color: 'green',
    parentId: 'ui-elements',
  },
  {
    id: 'audio',
    name: 'Audio Files',
    fileCount: 4,
    size: 9.7,
    color: 'orange',
  },
  {
    id: 'music',
    name: 'Music',
    fileCount: 2,
    size: 6.1,
    color: 'orange',
    parentId: 'audio',
  },
  {
    id: 'sfx',
    name: 'Sound Effects',
    fileCount: 2,
    size: 3.6,
    color: 'orange',
    parentId: 'audio',
  },
  {
    id: 'documents',
    name: 'Documents',
    fileCount: 3,
    size: 2.8,
    color: 'gray',
  },
  { id: 'archived', name: 'Archived', fileCount: 5, size: 8.9, color: 'red' },
];

export const mediaFiles: MediaFile[] = [
  {
    id: '1',
    name: 'player-sprite.png',
    type: 'image',
    size: 2.4,
    uploadDate: new Date('2024-01-15'),
    folder: 'sprites',
    url: 'https://minio.buymed.site/library/df23285e-75a8-4b71-8549-01972084fa7d/abc/giga-archery.png',
    thumbnail:
      'https://minio.buymed.site/library/df23285e-75a8-4b71-8549-01972084fa7d/abc/giga-archery.png',
    dimensions: { width: 64, height: 64 },
    usedInProjects: ['Flappy Bird Game', 'Platformer Demo'],
  },
  {
    id: '2',
    name: 'background-music.mp3',
    type: 'audio',
    size: 5.2,
    uploadDate: new Date('2024-01-14'),
    folder: 'music',
    url: '/audio/background-music.mp3',
    duration: 180,
    usedInProjects: ['Flappy Bird Game'],
  },
  {
    id: '3',
    name: 'game-background.jpg',
    type: 'image',
    size: 3.8,
    uploadDate: new Date('2024-01-13'),
    folder: 'backgrounds',
    url: '/placeholder.svg?height=400&width=600&text=Game+Background',
    thumbnail: '/placeholder.svg?height=100&width=150&text=BG',
    dimensions: { width: 1920, height: 1080 },
    usedInProjects: ['Flappy Bird Game'],
  },
  {
    id: '4',
    name: 'button-hover.png',
    type: 'image',
    size: 1.2,
    uploadDate: new Date('2024-01-12'),
    folder: 'buttons',
    url: '/placeholder.svg?height=50&width=150&text=Button',
    thumbnail: '/placeholder.svg?height=50&width=150&text=Btn',
    dimensions: { width: 200, height: 60 },
  },
  {
    id: '5',
    name: 'jump-sound.wav',
    type: 'audio',
    size: 0.8,
    uploadDate: new Date('2024-01-11'),
    folder: 'sfx',
    url: '/audio/jump-sound.wav',
    duration: 2,
    usedInProjects: ['Flappy Bird Game', 'Platformer Demo'],
  },
  {
    id: '6',
    name: 'game-trailer.mp4',
    type: 'video',
    size: 15.6,
    uploadDate: new Date('2024-01-10'),
    folder: 'game-assets',
    url: '/video/game-trailer.mp4',
    thumbnail: '/placeholder.svg?height=100&width=150&text=Video',
    duration: 45,
  },
];

// Helper functions
export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  );
}

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
