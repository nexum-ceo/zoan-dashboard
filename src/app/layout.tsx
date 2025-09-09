// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import AppProvider from '@/components/app-provider';
import SessionProvider from '@/components/session-provider';
import { baseOpenGraph } from '@/shared-metadata';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: '%s | Zoan AI',
      default: 'Zoan AI',
    },
    description: 'Zoan AI',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased h-screen w-full m-0 p-0`}>
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
