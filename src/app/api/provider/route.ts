import providerApiRequest from '@/api-requests/provider';
import { apiWrapper } from '@/lib/api-wrapper';
import { CreateProviderBodyType } from '@/types/provider';
import { NextResponse } from 'next/server';

export async function GET() {
  // try {
  //   const response = await providerApiRequest.list();

  //   return NextResponse.json(response.data);
  // } catch (error) {
  //   let message = 'Fetch provider failed';

  //   if (error instanceof Error) {
  //     message = error.message;
  //   }

  //   if (message === 'Request failed with status code 401') {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  //   }

  //   return NextResponse.json({ error: message }, { status: 500 });
  // }
  return await apiWrapper(providerApiRequest.list, {
    onSuccess: (data) => NextResponse.json(data),
  });
}

export async function POST(req: Request) {
  try {
    const body: CreateProviderBodyType = await req.json();
    const response = await providerApiRequest.add(body);

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Create failed';
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
