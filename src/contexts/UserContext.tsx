'use client';
import { useSession } from 'next-auth/react';
import {
  createContext,
  ReactNode,
  useCallback,
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
  refetchProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!session?.accessToken) {
      setUserProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await response.json();
      setUserProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  const refetchProfile = async () => {
    await fetchUserProfile();
  };

  // Use profile from session if available, otherwise fetch it
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      if (session.userProfile) {
        // Use profile from session (fetched during login)
        setUserProfile(session.userProfile);
        setIsLoading(false);
        setError(null);
      } else {
        // Fallback: fetch profile if not in session
        fetchUserProfile();
      }
    } else if (status === 'unauthenticated') {
      setUserProfile(null);
      setError(null);
      setIsLoading(false);
    }
  }, [session, status, fetchUserProfile]);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        isLoading,
        error,
        refetchProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
