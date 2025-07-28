import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axiosInstance from '@/lib/axios-instance';
import { GetAgentResType } from '@/types/agent';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log('session:', session);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axiosInstance.get<GetAgentResType>(
      `/provider/list`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );
    console.log('Provider list fetched successfully:', response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log(`Error fetching provider list: ${error.message}`);
    return NextResponse.json(
      { error: error?.message || 'Fetch provider failed' },
      { status: 500 },
    );
  }
}

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session?.accessToken) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const payload: TokenPayloadType = jwtDecode(session.accessToken);

//   try {
//     let body: CreateProviderBodyType = await req.json();
//     if (!body.user_id) {
//       body.user_id = payload.userId;
//     }

//     const response = await axiosInstance.post('/provider', body, {
//       headers: {
//         Authorization: `Bearer ${session.accessToken}`,
//       },
//     });
//     return NextResponse.json(response.data);
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error?.message || 'Create failed' },
//       { status: 500 },
//     );
//   }
// }
