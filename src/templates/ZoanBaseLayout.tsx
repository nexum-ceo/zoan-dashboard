'use client';
import AppNavbar from '@/components/app-navbar';
import { SessionProvider } from 'next-auth/react';

export default function ZoanBaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SessionProvider>
        <AppNavbar />
        {children}
      </SessionProvider>
    </>
  );
}
