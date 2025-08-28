import { apiWrapper } from '@/lib/api-wrapper';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const folderPath = searchParams.get('folderPath');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId is required' }), {
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

      let url: string;
      if (!folderPath || folderPath === 'all') {
        // Get all files for user
        url = `${minioUrl}/library/?prefix=${userId}`;
      } else {
        // Get files in specific folder
        url = `${minioUrl}/library/?prefix=${userId}/${folderPath}&delimiter=/`;
      }

      const response = await axios.get(url, {
        responseType: 'text',
      });

      // Return XML data wrapped in data property
      return { data: response.data };
    },
    {
      defaultErrorMessage: 'Failed to fetch files',
    },
  );
}
