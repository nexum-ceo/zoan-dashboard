import { apiWrapper } from '@/lib/api-wrapper';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return new Response(JSON.stringify({ error: 'path is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return await apiWrapper(
      async () => {
        const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL;
        if (!minioUrl) {
          throw new Error('MinIO URL not configured');
        }

        // Delete the folder and all its contents from MinIO
        // MinIO will recursively delete all objects with the given prefix
        await axios.delete(`${minioUrl}/library/${path}?recursive=true`);

        return { data: { message: 'Folder deleted successfully' } };
      },
      {
        defaultErrorMessage: 'Failed to delete folder',
      },
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
