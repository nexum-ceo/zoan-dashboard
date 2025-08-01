import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import axiosInstance from '@/lib/axios-instance';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axiosInstance.get(
      `/chat/${(await params).id}/messages`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );
    console.log('chat messages response:', response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Fetch failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
