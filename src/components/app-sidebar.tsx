'use client';
import { Bot, Home, PanelRight, Settings } from 'lucide-react';

import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Image from 'next/image';
import Link from 'next/link';

// Menu items.
const items = [
  {
    title: 'Playground',
    url: '/dashboard/playground',
    icon: Home,
  },
  {
    title: 'Assistants',
    url: '/dashboard/assistant',
    icon: Bot,
  },
  {
    title: 'Settings',
    url: '/dashboard/setting',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { toggleSidebar } = useSidebar();
  const { session } = useAuthGuard();

  // Get user data directly from session
  const user = session?.user;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image src="/icon.png" alt="Logo" width={32} height={32} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={() => toggleSidebar()}>
                  <div>
                    <PanelRight />
                    <span>Playground</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            email: user?.email || '',
            avatar: './avatar.png',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
