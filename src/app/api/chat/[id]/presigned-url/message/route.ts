import chatApiRequest from '@/api-requests/chat';
import { apiWrapper } from '@/lib/api-wrapper';
import { PresignedUrlBodyType } from '@/types/chat';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body: PresignedUrlBodyType = await req.json();
  return await apiWrapper(() => chatApiRequest.getPresignedUrl(id, body), {
    defaultErrorMessage: 'Get presigned urls failed',
  });
}
