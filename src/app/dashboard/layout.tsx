import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AgentProvider } from '@/contexts/AgentContext';
import ZoanBaseLayout from '@/templates/ZoanBaseLayout';
import { ReactNode } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ZoanBaseLayout>
      <AgentProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className="bg-gray-50 h-screen w-full">{children}</div>
        </SidebarProvider>
      </AgentProvider>
    </ZoanBaseLayout>
  );
}
