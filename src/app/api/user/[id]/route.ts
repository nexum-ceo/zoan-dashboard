import userApiRequest from '@/api-requests/user';
import { apiWrapper } from '@/lib/api-wrapper';
import { UserProfileUpdateType } from '@/types/user';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body: UserProfileUpdateType = await req.json();
  return await apiWrapper(() => userApiRequest.updateUserById(id, body), {
    defaultErrorMessage: 'Update user profile failed',
  });
}
