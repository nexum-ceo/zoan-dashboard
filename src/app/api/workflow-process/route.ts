import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import axiosInstance from '@/lib/axios-instance';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const response = await axiosInstance.post('/workflow-process', body, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Create failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
