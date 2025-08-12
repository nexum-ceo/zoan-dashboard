// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import AppProvider from '@/components/app-provider';
import SessionProvider from '@/components/session-provider';
import { baseOpenGraph } from '@/shared-metadata';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Zoan AI Assistant',
    description: 'Zoan AI Assistant',
    openGraph: {
      ...baseOpenGraph,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  console.log('session root:', session);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-full m-0 p-0`}
      >
        <AppProvider>
          <SessionProvider>
            <div className="h-full w-full">{children}</div>
            <Toaster />
          </SessionProvider>
        </AppProvider>
      </body>
    </html>
  );
}
