import userApiRequest from '@/api-requests/user';
import { apiWrapper } from '@/lib/api-wrapper';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return await apiWrapper(() => userApiRequest.sGetUserProfile(id), {
    defaultErrorMessage: 'Fetch user profile failed',
  });
}
