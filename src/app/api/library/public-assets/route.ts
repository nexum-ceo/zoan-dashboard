import { apiWrapper } from '@/lib/api-wrapper';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderPath = searchParams.get('folderPath') || '';

  return await apiWrapper(
    async () => {
      const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL;
      if (!minioUrl) {
        throw new Error('MinIO URL not configured');
      }

      let url: string;
      if (!folderPath) {
        // Get all public assets
        url = `${minioUrl}/library/?prefix=assets/&delimiter=/`;
      } else {
        // Get assets in specific folder
        url = `${minioUrl}/library/?prefix=assets/${folderPath}&delimiter=/`;
      }

      const response = await axios.get(url, {
        responseType: 'text',
      });

      // Return XML data wrapped in data property
      return { data: response.data };
    },
    {
      defaultErrorMessage: 'Failed to fetch public assets',
    },
  );
}
