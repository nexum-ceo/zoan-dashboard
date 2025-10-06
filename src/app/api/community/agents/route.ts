import communityApiRequest from '@/api-requests/community';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET() {
  return await apiWrapper(() => communityApiRequest.getCommunityAgent(), {
    defaultErrorMessage: 'Failed to fetch community agents',
  });
}
