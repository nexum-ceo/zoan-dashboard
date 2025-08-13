'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ThemeToggleButton,
  useThemeTransition,
} from '@/components/ui/shadcn-io/theme-toggle-button';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { IconLogout } from '@tabler/icons-react';
import {
  BookOpen,
  DollarSign,
  MessageSquare,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { FC, useEffect } from 'react';

export type NavUserProps = {
  user: {
    email: string;
    avatar: string;
  };
};

export const NavUser: FC<NavUserProps> = ({ user }) => {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { startTransition } = useThemeTransition();

  // BroadcastChannel allow logout across tabs
  useEffect(() => {
    const channel = new BroadcastChannel('auth');
    channel.onmessage = (event) => {
      if (event.data === 'logout') {
        signOut();
      }
    };
    return () => channel.close();
  }, []);

  const handleLogout = () => {
    const channel = new BroadcastChannel('auth');
    channel.postMessage('logout');
    channel.close();
    signOut();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-fit"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.email} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.email} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.email}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Pricing</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Documentation</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Community Forum</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Feedback</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <div className="text-xs font-medium text-muted-foreground">
                Preferences
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Theme</span>
                <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
                  <ThemeToggleButton
                    theme="light"
                    className={`rounded-full p-0 ${
                      theme === 'light' ? 'text-primary' : 'text-gray-400'
                    }`}
                    onClick={() => startTransition(() => setTheme('light'))}
                    variant="circle"
                    start="bottom-left"
                  />
                  <ThemeToggleButton
                    theme="system"
                    className={`rounded-full p-0 ${
                      theme === 'system' ? 'text-primary' : 'text-gray-400'
                    }`}
                    onClick={() => startTransition(() => setTheme('system'))}
                    variant="circle"
                    start="bottom-left"
                  />
                  <ThemeToggleButton
                    className={`rounded-full p-0 ${
                      theme === 'dark' ? 'text-primary' : 'text-gray-400'
                    }`}
                    theme="dark"
                    onClick={() => startTransition(() => setTheme('dark'))}
                    variant="circle"
                    start="bottom-left"
                  />
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
