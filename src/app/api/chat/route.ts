import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axiosInstance from '@/lib/axios-instance';
import {
  CreateChatBodyType,
  CreateChatResType,
  GetChatListResType,
} from '@/types/chat';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateChatBodyType = await req.json();

    const response = await axiosInstance.post<CreateChatResType>(
      '/chat/',
      body,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Create failed' },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log('session', session);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axiosInstance.get<GetChatListResType>('/chat/', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Fetch failed' },
      { status: 500 },
    );
  }
}
