import providerApiRequest from '@/api-requests/provider';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await providerApiRequest.getProviderOfUser();

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Fetch provider failed';
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
