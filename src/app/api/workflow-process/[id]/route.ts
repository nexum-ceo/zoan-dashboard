import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axiosInstance from '@/lib/axios-instance';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axiosInstance.get(`/workflow-process/${params.id}`, {
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
