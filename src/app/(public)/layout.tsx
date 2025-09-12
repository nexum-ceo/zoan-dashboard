import AnnouncementBar from '@/components/announcement-bar';
import AppNavbar from '@/components/app-navbar';
import SessionProvider from '@/components/session-provider';
import ZoanBaseLayout from '@/templates/ZoanBaseLayout';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ZoanBaseLayout>
      <AnnouncementBar />
      <SessionProvider>
        <AppNavbar />
      </SessionProvider>
      {children}
    </ZoanBaseLayout>
  );
}
