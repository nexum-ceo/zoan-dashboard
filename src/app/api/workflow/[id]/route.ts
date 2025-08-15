import workflowApiRequest from '@/api-requests/workflow';
import { apiWrapper } from '@/lib/api-wrapper';

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return await apiWrapper(() => workflowApiRequest.delete(id), {
    defaultErrorMessage: 'Delete failed',
  });
}
