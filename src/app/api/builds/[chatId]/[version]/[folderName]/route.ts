import libraryApiRequest from '@/api-requests/library';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET(
  _: Request,
  {
    params,
  }: {
    params: Promise<{ chatId: string; version: string; folderName: string }>;
  },
) {
  const { chatId, version, folderName } = await params;
  const gameUrl = `${chatId}/${version}`;

  return await apiWrapper(
    async () => {
      // Fetch content from the specific folder
      const folderContent = await libraryApiRequest.sGetGameFolderContent(
        gameUrl,
        folderName,
      );
      return folderContent;
    },
    {
      defaultErrorMessage: 'Failed to fetch folder content',
    },
  );
}
