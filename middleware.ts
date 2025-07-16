// middleware.ts
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/profile', '/settings']; // customize as needed

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  if (!isProtected) return NextResponse.next();

  if (!token) {
    // No token, redirect to login
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const accessTokenExpires = (token.accessTokenExpires ?? 0) as number;

  if (Date.now() > accessTokenExpires) {
    // Token expired, redirect to login
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}
