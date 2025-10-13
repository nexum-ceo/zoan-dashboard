'use client';
import { useCurrentUserProfile } from '@/queries/useUser';
import { useSession } from 'next-auth/react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
  bio?: string;
  location?: string;
  xHandle?: string;
  githubHandle?: string;
  website?: string;
  avatar?: string;
  totalPrompts?: number;
  createdAt: string;
  updatedAt: string;
};

type UserContextType = {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Use React Query to fetch current user profile
  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch: refetchQuery,
  } = useCurrentUserProfile();

  const refetchProfile = () => {
    refetchQuery();
  };

  // Use React Query data to set user profile
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      if (queryData?.data) {
        // Transform API response to UserProfile format
        const profileData = queryData.data.data;
        const transformedProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          username: profileData.username,
          bio: '', // Not available in current API
          location: '', // Not available in current API
          xHandle:
            profileData.social_link.find(
              (s: { type: string; url: string }) => s.type === 'x',
            )?.url || '',
          githubHandle:
            profileData.social_link.find(
              (s: { type: string; url: string }) => s.type === 'github',
            )?.url || '',
          website:
            profileData.social_link.find(
              (s: { type: string; url: string }) => s.type === 'website',
            )?.url || '',
          avatar: '', // Not available in current API
          totalPrompts: 0, // Not available in current API
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
        };
        setUserProfile(transformedProfile);
      }
    } else if (status === 'unauthenticated') {
      setUserProfile(null);
    }
  }, [session, status, queryData]);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        isLoading,
        error: queryError?.message || null,
        refetchProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserQuery() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserQuery must be used within a UserProvider');
  }
  return context;
}
