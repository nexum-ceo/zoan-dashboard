import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axiosInstance from '@/lib/axios-instance';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log('Session in workflow route:', session?.accessToken);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axiosInstance.get('/workflow/', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    console.log('Workflow data fetched successfully:', response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log('Error fetching workflow data:', error.message);
    return NextResponse.json(
      { error: error?.message || 'Fetch failed' },
      { status: 500 },
    );
  }
}
