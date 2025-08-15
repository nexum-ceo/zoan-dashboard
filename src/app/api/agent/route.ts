import agentApiRequest from '@/api-requests/agent';
import { apiWrapper } from '@/lib/api-wrapper';
import { CreateAgentBodyType } from '@/types/agent';

export async function GET() {
  return await apiWrapper(() => agentApiRequest.list(), {
    defaultErrorMessage: 'Fetch failed',
  });
}

export async function POST(req: Request) {
  const body: CreateAgentBodyType = await req.json();
  return await apiWrapper(() => agentApiRequest.add(body), {
    defaultErrorMessage: 'Create failed',
  });
}
