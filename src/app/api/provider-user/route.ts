import providerApiRequest from '@/api-requests/provider';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET() {
  return await apiWrapper(() => providerApiRequest.getProviderOfUser(), {
    defaultErrorMessage: 'Fetch provider failed',
  });
}
