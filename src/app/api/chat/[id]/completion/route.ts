import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  // Read raw body and forward to upstream
  let forwardedBody: string | undefined;
  try {
    forwardedBody = await req.text();
  } catch {
    forwardedBody = undefined;
  }

  console.log('body from client', forwardedBody);
  console.log('method', req.method);

  const upstreamUrl = `${
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
  }/chat/${id}/completion`;

  const upstream = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
      Accept: 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    },
    body: forwardedBody,
    cache: 'no-store',
  });

  console.log('up stream status:', upstream.status);
  console.log(
    'up stream headers:',
    Object.fromEntries(upstream.headers.entries()),
  );

  if (!upstream.ok || !upstream.body) {
    console.error('Upstream error:', upstream.status, upstream.statusText);
    return new Response('Upstream stream error', { status: 502 });
  }

  // Try to use the upstream response directly first
  if (upstream.headers.get('content-type')?.includes('text/event-stream')) {
    console.log('Upstream is already SSE, forwarding directly');
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const transformStream = new ReadableStream({
    start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      console.log('Starting stream transformation...');

      const pump = () => {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              console.log('Stream done, closing controller');
              // Send any remaining buffer
              if (buffer.trim()) {
                console.log('Sending remaining buffer:', buffer.trim());
                controller.enqueue(
                  new TextEncoder().encode(`data: ${buffer.trim()}\n\n`),
                );
              }
              controller.close();
              return;
            }

            // Decode the chunk and add to buffer
            const chunk = decoder.decode(value, { stream: true });
            console.log('Received chunk from upstream:', chunk);
            buffer += chunk;

            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine) {
                console.log('Processing line:', trimmedLine);
                // If it's already in SSE format, forward as-is
                if (
                  trimmedLine.startsWith('data: ') ||
                  trimmedLine.startsWith('event: ')
                ) {
                  console.log('Forwarding SSE line:', line);
                  controller.enqueue(new TextEncoder().encode(line + '\n'));
                } else {
                  // If it's raw JSON, wrap in SSE format
                  try {
                    JSON.parse(trimmedLine);
                    console.log('Wrapping JSON in SSE format:', trimmedLine);
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${trimmedLine}\n\n`),
                    );
                  } catch {
                    // If not JSON, treat as plain text
                    console.log('Treating as plain text:', trimmedLine);
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${trimmedLine}\n\n`),
                    );
                  }
                }
              }
            }

            pump();
          })
          .catch((error) => {
            console.error('Stream pump error:', error);
            try {
              controller.close();
            } catch {}
          });
      };
      pump();
      req.signal.addEventListener('abort', () => {
        console.log('Request aborted, closing stream');
        try {
          controller.close();
        } catch {}
      });
    },
  });
  console.log('transformStream', transformStream);

  return new Response(transformStream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
