import agentApiRequest from '@/api-requests/agent';
import { apiWrapper } from '@/lib/api-wrapper';
import { UpdateAgentBodyType } from '@/types/agent';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return await apiWrapper(() => agentApiRequest.getAgent(id), {
    defaultErrorMessage: 'Fetch failed',
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body: UpdateAgentBodyType = await req.json();
  return await apiWrapper(() => agentApiRequest.update(id, body), {
    defaultErrorMessage: 'Update failed',
  });
}
