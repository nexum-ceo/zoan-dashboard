import workflowApiRequest from '@/api-requests/workflow';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const response = await workflowApiRequest.delete((await params).id);

    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Delete failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
