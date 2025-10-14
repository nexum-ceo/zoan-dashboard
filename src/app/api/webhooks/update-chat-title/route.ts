import { UpdateChatTitleBodySchema } from '@/types/chat';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Extract authorization token from header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 },
      );
    }

    const body = await req.json();

    // Validate the request body
    const { chatId, title } = body;

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 },
      );
    }

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    // Validate title format
    const validationResult = UpdateChatTitleBodySchema.safeParse({ title });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid title format',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    // Call the backend API directly with the authorization token
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'Failed to update chat title',
          details: errorData,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Broadcast the update to all connected clients via SSE
    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_NEXT_SERVER_URL || 'http://localhost:3000'
        }/api/webhooks/broadcast-chat-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatId, title }),
        },
      );
    } catch (broadcastError) {
      console.error('Failed to broadcast update:', broadcastError);
      // Continue even if broadcast fails
    }

    return NextResponse.json(
      {
        success: true,
        data,
        chatId,
        title,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
