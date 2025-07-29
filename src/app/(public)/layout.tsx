import AppNavbar from '@/components/app-navbar';
import ZoanBaseLayout from '@/templates/ZoanBaseLayout';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ZoanBaseLayout>
      <AppNavbar />
      {children}
    </ZoanBaseLayout>
  );
}
