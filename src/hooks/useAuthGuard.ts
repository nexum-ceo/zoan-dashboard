import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export const useAuthGuard = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      const now = new Date().getTime() / 1000 - 1;
      // Only auto-signout if session exists but is expired
      // Don't signout if session is null (user might be on public route)
      if (session && Number(session?.expires) <= now) {
        await signOut();
      }
    };
    handleLogout();
  }, [session]);

  const handleFetchError = useCallback(
    async (response: Response) => {
      if (response.status === 401) {
        // Token invalid or expired, logout completely
        await signOut({ redirect: false });
        router.push('/login');
        return true; // Indicates that logout was triggered
      }
      return false;
    },
    [router],
  );

  return {
    session,
    handleFetchError,
  };
};
