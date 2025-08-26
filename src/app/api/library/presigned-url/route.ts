import libraryApiRequest from '@/api-requests/library';
import { apiWrapper } from '@/lib/api-wrapper';
import { PresignedUrlBodyType } from '@/types/library';

export async function POST(req: Request) {
  const body: PresignedUrlBodyType = await req.json();
  return await apiWrapper(() => libraryApiRequest.getPresignedUrls(body), {
    defaultErrorMessage: 'Get presigned urls failed',
  });
}
