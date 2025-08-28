import { apiWrapper } from '@/lib/api-wrapper';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

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

      const response = await axios.get(
        `${minioUrl}/library/?prefix=${userId}/&delimiter=/`,
        {
          responseType: 'text',
        },
      );

      // Return XML data wrapped in data property
      return { data: response.data };
    },
    {
      defaultErrorMessage: 'Failed to fetch folders',
    },
  );
}
