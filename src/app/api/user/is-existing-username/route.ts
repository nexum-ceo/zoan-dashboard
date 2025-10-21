import userApiRequest from '@/api-requests/user';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = url.searchParams.get('username');
  return await apiWrapper(
    () => userApiRequest.checkUsernameExists(username || ''),
    {
      defaultErrorMessage: 'Fetch user profile failed',
    },
  );
}
