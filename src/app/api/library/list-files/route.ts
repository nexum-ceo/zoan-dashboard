import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const folderPath = searchParams.get('folderPath');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL;
    if (!minioUrl) {
      return NextResponse.json(
        { error: 'MinIO URL not configured' },
        { status: 500 },
      );
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

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 },
    );
  }
}
