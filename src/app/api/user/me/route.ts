import userApiRequest from '@/api-requests/user';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET() {
  return await apiWrapper(() => userApiRequest.getCurrentUserProfile(), {
    defaultErrorMessage: 'Fetch user profile failed',
  });
}
