import providerApiRequest from '@/api-requests/provider';
import { apiWrapper } from '@/lib/api-wrapper';
import { CreateProviderBodyType } from '@/types/provider';

export async function GET() {
  return await apiWrapper(providerApiRequest.list, {
    defaultErrorMessage: 'Fetch provider failed',
  });
}

export async function POST(req: Request) {
  const body: CreateProviderBodyType = await req.json();
  return await apiWrapper(() => providerApiRequest.add(body), {
    defaultErrorMessage: 'Create provider failed',
  });
}
