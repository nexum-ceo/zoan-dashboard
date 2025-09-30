import chatApiRequest from '@/api-requests/chat';
import { apiWrapper } from '@/lib/api-wrapper';
import { PresignedUrlBodyType } from '@/types/library';

export async function POST(req: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const body: PresignedUrlBodyType = await req.json();
  return await apiWrapper(() => chatApiRequest.getPresignedUrl(id, body), {
    defaultErrorMessage: 'Get presigned urls failed',
  });
}
