import { NextResponse } from 'next/server';

// Store active SSE connections
const clients = new Set<ReadableStreamDefaultController>();

// POST endpoint to broadcast updates
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chatId, title } = body;

    // Broadcast to all connected clients
    const message = JSON.stringify({
      type: 'chat-title-update',
      chatId,
      title,
    });

    let successCount = 0;
    clients.forEach((controller) => {
      try {
        controller.enqueue(`data: ${message}\n\n`);
        successCount++;
      } catch {
        // Remove dead connections
        clients.delete(controller);
      }
    });

    return NextResponse.json({
      success: true,
      clientsNotified: successCount,
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast update' },
      { status: 500 },
    );
  }
}

// GET endpoint for SSE connections
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Add this client to the set
      clients.add(controller);

      // Send initial connection message
      controller.enqueue('data: {"type":"connected"}\n\n');

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue('data: {"type":"ping"}\n\n');
        } catch {
          clearInterval(keepAlive);
          clients.delete(controller);
        }
      }, 30000);

      // Cleanup on close
      return () => {
        clearInterval(keepAlive);
        clients.delete(controller);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
