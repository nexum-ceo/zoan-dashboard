import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // When setting cookie with expires, there will be a deviation of about 0 - 1000ms, so to be safe, we subtract 1s.
    const now = new Date().getTime() / 1000 - 1;

    if (now >= Number(req.nextauth.token?.accessTokenExpires)) {
      req.nextauth.token = null; // Clear token to prevent further access
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('callbackUrl', req.url);
      console.log(
        'Token expired, redirecting to login:',
        redirectUrl.toString(),
      );
      return NextResponse.redirect(redirectUrl);
    }
  },
  {
    pages: {
      signIn: '/login',
      signOut: '/',
    },
  },
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
