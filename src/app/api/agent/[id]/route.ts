import agentApiRequest from '@/api-requests/agent';
import { UpdateAgentBodyType } from '@/types/agent';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const response = await agentApiRequest.getAgent(`${(await params).id}`);

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Fetch failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,

  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body: UpdateAgentBodyType = await req.json();

    const response = await agentApiRequest.update(`${(await params).id}`, body);

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Update failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
