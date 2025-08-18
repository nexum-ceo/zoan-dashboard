import chatApiRequest from '@/api-requests/chat';
import { apiWrapper } from '@/lib/api-wrapper';
import { CreateChatAgentSettingBodyType } from '@/types/chat';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return await apiWrapper(
    () => chatApiRequest.getChatAgentSettingByChatId(id),
    {
      defaultErrorMessage: 'Fetch failed',
    },
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body: CreateChatAgentSettingBodyType = await req.json();
  return await apiWrapper(
    () => chatApiRequest.createChatAgentSetting(id, body),
    {
      defaultErrorMessage: 'Create failed',
    },
  );
}
