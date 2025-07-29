// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import axiosInstance from '@/lib/axios-instance';
import { CreateWorkflowType, WorkflowType } from '@/types/workflow';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axiosInstance.get<WorkflowType[]>('/workflow/', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

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
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateWorkflowType = await req.json();

    const response = await axiosInstance.post<WorkflowType>(
      '/workflow/',
      body,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );
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
