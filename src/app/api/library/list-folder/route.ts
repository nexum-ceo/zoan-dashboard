import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

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

    const response = await axios.get(
      `${minioUrl}/library/?prefix=${userId}/&delimiter=/`,
      {
        responseType: 'text',
      },
    );

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 },
    );
  }
}
