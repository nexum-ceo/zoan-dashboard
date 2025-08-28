import libraryApiRequest from '@/api-requests/library';
import { apiWrapper } from '@/lib/api-wrapper';
import { NextRequest } from 'next/server';

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  return await apiWrapper(() => libraryApiRequest.deleteFile(body.path), {
    defaultErrorMessage: 'Delete failed',
  });
}
