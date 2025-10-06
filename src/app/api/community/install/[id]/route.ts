import communityApiRequest from '@/api-requests/community';
import { apiWrapper } from '@/lib/api-wrapper';

export async function POST(req: Request) {
  const body: { agentId: string } = await req.json();

  return await apiWrapper(
    () => communityApiRequest.installCommunityAgentBackend(body.agentId),
    {
      defaultErrorMessage: 'Install failed',
    },
  );
}
