import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axiosInstance from '@/lib/axios-instance';
import { CreateChatBodyType, CreateChatResType } from '@/types/chat';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const result = streamText({
//     model: openai('gpt-4o-mini'),
//     messages,
//     system:
//       'Always respond in full capital letters. If you are asked to generate UI code, prefer to return code in ReactJS or Next.js (using JSX/TSX), and use Tailwind CSS for styling when possible, as these are the most popular frontend tech stacks right now.',
//   });

//   return result.toDataStreamResponse();
// }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateChatBodyType = await req.json();

    const response = await axiosInstance.post<CreateChatResType>(
      '/chat/',
      body,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );
    console.log('Chat created successfully:', response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Create failed' },
      { status: 500 },
    );
  }
}
