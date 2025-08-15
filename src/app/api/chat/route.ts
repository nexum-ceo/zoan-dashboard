// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import chatApiRequest from '@/api-requests/chat';
import { apiWrapper } from '@/lib/api-wrapper';
import { CreateChatBodyType } from '@/types/chat';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body: CreateChatBodyType = await req.json();
    const response = await chatApiRequest.add(body);

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Create failed';
    if (error instanceof Error) {
      message = error.message;
    }

    if (message === 'Request failed with status code 401') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return await apiWrapper(() => chatApiRequest.list(), {
    defaultErrorMessage: 'Fetch failed',
  });
}
