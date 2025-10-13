import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import { TUser } from '@/const/types';
import { UserProfile } from '@/contexts/UserContext';
import axiosInstance from '@/lib/axios-instance';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await axiosInstance.get<TUser>('/me', {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (response.status !== 200) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Transform the basic user data to include profile fields
  const userProfile: UserProfile = {
    id: response.data.id,
    email: response.data.email,
    displayName: response.data.displayName || response.data.email.split('@')[0],
    username: response.data.username || response.data.email.split('@')[0],
    bio: response.data.bio || '',
    location: response.data.location || '',
    xHandle: response.data.xHandle || '',
    githubHandle: response.data.githubHandle || '',
    website: response.data.website || '',
    avatar: response.data.avatar || '',
    totalPrompts: response.data.totalPrompts || 0,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };

  return NextResponse.json(userProfile);
}
