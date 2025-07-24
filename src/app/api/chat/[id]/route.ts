import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axiosInstance from '@/lib/axios-instance';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = context.params ? context.params : undefined;
  const id = (await params?.id) || context.params?.id;

  try {
    const response = await axiosInstance.get(`/chat/${id}`, {
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
