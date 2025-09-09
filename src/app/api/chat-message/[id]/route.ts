import chatApiRequest from '@/api-requests/chat';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { searchParams } = new URL(req.url);
  const offset = searchParams.get('offset')
    ? Number(searchParams.get('offset'))
    : 0;
  const limit = searchParams.get('limit')
    ? Number(searchParams.get('limit'))
    : 10;
  return await apiWrapper(
    () => chatApiRequest.getChatMessages(id, { offset, limit }),
    {
      defaultErrorMessage: 'Fetch failed',
    },
  );
}
