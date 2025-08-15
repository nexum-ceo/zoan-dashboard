import workflowApiRequest from '@/api-requests/workflow';
import { apiWrapper } from '@/lib/api-wrapper';
import { CreateWorkflowType } from '@/types/workflow';

export async function GET() {
  return await apiWrapper(() => workflowApiRequest.list(), {
    defaultErrorMessage: 'Fetch failed',
  });
}

export async function POST(req: Request) {
  const body: CreateWorkflowType = await req.json();
  return await apiWrapper(() => workflowApiRequest.add(body), {
    defaultErrorMessage: 'Create failed',
  });
}
