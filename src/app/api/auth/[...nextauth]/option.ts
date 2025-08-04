import { jwtDecode } from 'jwt-decode';
import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Zoan Passport',
      credentials: {
        authCode: { label: 'Auth Code', type: 'text' },
      },
      authorize: async (credentials) => {
        console.log('Authorizing with credentials:', credentials?.authCode);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auth_code: credentials?.authCode }),
          },
        );
        console.log('res:', res);

        if (!res.ok) return null;

        const { data } = await res.json();

        return {
          ...data.user,
          accessToken: data.access_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.accessToken) {
        const expireAccessToken = jwtDecode(user.accessToken)?.exp;
        token.accessToken = user.accessToken;
        token.accessTokenExpires = expireAccessToken;
        // Store user data in token
        token.user = {
          id: user.id || undefined,
          email: user.email || undefined,
          name: user.name || undefined,
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.expires = token.accessTokenExpires;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
