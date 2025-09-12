import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const body = await req.json();

  const upstreamUrl = `${
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
  }/chat/${id}/messages`;

  const upstream = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('Content-Type') || 'application/json',
    },
  });
}
