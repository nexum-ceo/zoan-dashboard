import modelApiRequest from '@/api-requests/model';
import { apiWrapper } from '@/lib/api-wrapper';

export async function POST(req: Request) {
  const body: { name: string } = await req.json();
  return await apiWrapper(() => modelApiRequest.getModel(body.name), {
    defaultErrorMessage: 'Fetch provider failed',
  });
}
