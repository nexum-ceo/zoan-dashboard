'use client';
import { useCurrentUserProfile } from '@/queries/useUser';
import { UserProfileType } from '@/types/user';
import { useSession } from 'next-auth/react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type UserContextType = {
  userProfile: UserProfileType | null;
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);

  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch: refetchQuery,
  } = useCurrentUserProfile();

  const refetchProfile = () => {
    refetchQuery();
  };

  useEffect(() => {
    // Populate profile as soon as query resolves successfully
    if (queryData?.data) {
      const profileData = queryData.data.data;
      const transformedProfile: UserProfileType = {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role,
        name: profileData.name,
        username: profileData.username,
        social_link: profileData.social_link,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
      };
      setUserProfile(transformedProfile);
    }

    if (status === 'unauthenticated') {
      setUserProfile(null);
    }
  }, [status, queryData]);

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
