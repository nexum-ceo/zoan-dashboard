import agentApiRequest from '@/api-requests/agent';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET() {
  return await apiWrapper(() => agentApiRequest.getAgentAvailable(), {
    defaultErrorMessage: 'Fetch failed',
  });
}
