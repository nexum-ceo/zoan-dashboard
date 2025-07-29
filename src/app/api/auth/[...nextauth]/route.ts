import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import NextAuth from 'next-auth';

// export const authOptions: NextAuthOptions = {
//   providers: [
//     Credentials({
//       name: 'Zoan Passport',
//       credentials: {
//         authCode: { label: 'Auth Code', type: 'text' },
//       },
//       authorize: async (credentials) => {
//         console.log('Authorizing with credentials:', credentials?.authCode);
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ auth_code: credentials?.authCode }),
//           },
//         );

//         if (!res.ok) return null;

//         const { data } = await res.json();

//         return {
//           ...data.user,
//           accessToken: data.access_token,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user?.accessToken) {
//         token.accessToken = user.accessToken;
//         token.accessTokenExpires = Date.now() + 60 * 20 * 1000;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken;
//       return session;
//     },
//   },
//   session: {
//     strategy: 'jwt',
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
