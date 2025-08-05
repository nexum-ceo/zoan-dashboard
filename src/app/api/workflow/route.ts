import workflowApiRequest from '@/api-requests/workflow';
import { CreateWorkflowType } from '@/types/workflow';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await workflowApiRequest.list();

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
    const body: CreateWorkflowType = await req.json();

    const response = await workflowApiRequest.add(body);
    return NextResponse.json(response.data);
  } catch (error) {
    let message = 'Create failed';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export {};
