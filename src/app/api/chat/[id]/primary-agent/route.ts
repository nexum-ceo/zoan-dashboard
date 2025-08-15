import chatApiRequest from '@/api-requests/chat';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return await apiWrapper(() => chatApiRequest.getPrimaryAgentByChatId(id), {
    defaultErrorMessage: 'Fetch failed',
  });
}
