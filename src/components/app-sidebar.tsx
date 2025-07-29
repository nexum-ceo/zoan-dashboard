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
  const { toggleSidebar, open } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/">
                <img src="./icon.png" alt="Logo" width={32} height={32} />
              </a>
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
        {/* <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div>
                <img src="./icon.png" alt="Logo" width={32} height={32} />
                <span>ZOAN</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <NavUser
          user={{
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: './avatar.png',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
