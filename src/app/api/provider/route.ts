import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axiosInstance from '@/lib/axios-instance';
import { GetAgentResType } from '@/types/agent';
import { TokenPayloadType } from '@/types/auth';
import { CreateProviderBodyType } from '@/types/provider';
import { jwtDecode } from 'jwt-decode';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axiosInstance.get<GetAgentResType>('/provider', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Fetch provider failed' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload: TokenPayloadType = jwtDecode(session.accessToken);

  try {
    let body: CreateProviderBodyType = await req.json();
    if (!body.user_id) {
      body.user_id = payload.userId;
    }

    const response = await axiosInstance.post('/provider', body, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Create failed' },
      { status: 500 },
    );
  }
}
