import chatApiRequest from '@/api-requests/chat';
import { apiWrapper } from '@/lib/api-wrapper';
import { CreateChatBodyType } from '@/types/chat';

export async function POST(req: Request) {
  const body: CreateChatBodyType = await req.json();
  return await apiWrapper(() => chatApiRequest.add(body), {
    defaultErrorMessage: 'Create failed',
  });
}

export async function GET() {
  return await apiWrapper(() => chatApiRequest.list(), {
    defaultErrorMessage: 'Fetch failed',
  });
}
