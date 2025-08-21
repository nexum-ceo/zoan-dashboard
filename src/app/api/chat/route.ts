import chatApiRequest from '@/api-requests/chat';
import { apiWrapper } from '@/lib/api-wrapper';
import { CreateChatBodyType } from '@/types/chat';

export async function POST(req: Request) {
  const body: CreateChatBodyType = await req.json();
  return await apiWrapper(() => chatApiRequest.add(body), {
    defaultErrorMessage: 'Create failed',
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log('searchParams', searchParams);
  const offset = searchParams.get('offset')
    ? Number(searchParams.get('offset'))
    : 0;
  const limit = searchParams.get('limit')
    ? Number(searchParams.get('limit'))
    : 10;
  console.log('offset', offset);
  console.log('limit', limit);
  return await apiWrapper(() => chatApiRequest.list({ offset, limit }), {
    defaultErrorMessage: 'Fetch failed',
  });
}
