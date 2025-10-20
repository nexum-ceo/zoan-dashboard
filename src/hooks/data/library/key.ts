// Library Query Keys
export const LIBRARY_KEYS = {
  listFileOfUser: (userId: string) => ['list-file-of-user', userId] as const,
  listFolder: (userId: string) => ['list-folder', userId] as const,
  listFileInFolder: (userId: string, folderPath: string) =>
    ['list-file-in-folder', userId, folderPath] as const,
  listFileInGameFolder: (gameUrl: string) =>
    ['list-file-in-game-folder', gameUrl] as const,
  gameFolderContent: (gameUrl: string, folderPath: string = '') =>
    ['game-folder-content', gameUrl, folderPath] as const,
  publicAssets: (folderPath: string = '') =>
    ['public-assets', folderPath] as const,
} as const;
