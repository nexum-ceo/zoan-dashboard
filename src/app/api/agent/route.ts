import agentApiRequest from '@/api-requests/agent';
import { CreateAgentBodyType } from '@/types/agent';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await agentApiRequest.list();

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Fetch failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: CreateAgentBodyType = await req.json();

    const response = await agentApiRequest.add(body);

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Create failed';
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
