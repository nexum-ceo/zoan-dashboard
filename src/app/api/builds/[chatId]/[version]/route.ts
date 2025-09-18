import libraryApiRequest from '@/api-requests/library';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ chatId: string; version: string }> },
) {
  const { chatId, version } = await params;
  return await apiWrapper(
    () => libraryApiRequest.getListFileInGameFolder(`${chatId}/${version}`),
    {
      defaultErrorMessage: 'Fetch failed',
    },
  );
}
