// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import chatApiRequest from '@/api-requests/chat';
import { CreateChatBodyType } from '@/types/chat';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // const session = await getServerSession(authOptions);

  // if (!session?.accessToken) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const body: CreateChatBodyType = await req.json();

    // const response = await axiosInstance.post<CreateChatResType>(
    //   '/chat',
    //   body,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${session.accessToken}`,
    //     },
    //   },
    // );
    const response = await chatApiRequest.add(body);

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Create failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  // const session = await getServerSession(authOptions);
  // if (!session?.accessToken) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const response = await chatApiRequest.list();

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Fetch failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
