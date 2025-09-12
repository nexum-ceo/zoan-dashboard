import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const upstreamUrl = `${
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
  }/chat/${id}/stream`;

  const upstream = await fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
      Accept: 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Upstream stream error', { status: 502 });
  }

  const transformStream = new ReadableStream({
    start(controller) {
      const reader = upstream.body!.getReader();
      const pump = () => {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            if (value) controller.enqueue(value);
            pump();
          })
          .catch(() => {
            try {
              controller.close();
            } catch {}
          });
      };
      pump();
      req.signal.addEventListener('abort', () => {
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(transformStream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
