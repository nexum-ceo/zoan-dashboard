import modelApiRequest from '@/api-requests/model';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body: { name: string } = await req.json();
    const response = await modelApiRequest.getModel(body.name);

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Fetch provider failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
