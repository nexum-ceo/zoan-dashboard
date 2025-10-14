import { AppSidebar } from '@/components/layouts';
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
          <div className="bg-background h-screen w-full transition-colors duration-200">
            {children}
          </div>
        </SidebarProvider>
      </AgentProvider>
    </ZoanBaseLayout>
  );
}
