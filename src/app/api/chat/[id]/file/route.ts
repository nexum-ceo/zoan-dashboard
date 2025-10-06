import chatApiRequest from '@/api-requests/chat';
import { apiWrapper } from '@/lib/api-wrapper';
import { NextRequest } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return await apiWrapper(() => chatApiRequest.deleteFile(id, body.path), {
    defaultErrorMessage: 'Delete failed',
  });
}
