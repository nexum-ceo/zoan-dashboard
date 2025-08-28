import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    expires?: number;
    user?: (DefaultSession['user'] & { id?: string }) | null;
  }

  interface User extends DefaultUser {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
  }
}
