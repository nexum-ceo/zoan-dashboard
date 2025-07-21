import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axiosInstance from '@/lib/axios-instance';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('Loi rồi');
  try {
    const body = await req.json();
    console.log('body workflow-process', JSON.stringify(body));
    try {
      const response = await axiosInstance.post('/workflow-process/', body, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      console.log('response workflow-process ', response.data);
      return NextResponse.json(response.data);
    } catch (err: any) {
      // Log chi tiết lỗi từ axios
      if (err.response) {
        console.error('BE error:', err.response.status, err.response.data);
        return NextResponse.json(
          { error: err.response.data || 'BE error' },
          { status: 500 },
        );
      } else {
        console.error('Unknown error:', err.message);
        return NextResponse.json(
          { error: err.message || 'Unknown error' },
          { status: 500 },
        );
      }
    }
  } catch (error: any) {
    console.log(`error workflow-process`, error);
    return NextResponse.json(
      { error: error?.message || 'Create failed' },
      { status: 500 },
    );
  }
}
