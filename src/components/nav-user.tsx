'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import {
//   ThemeToggleButton,
//   useThemeTransition,
// } from '@/components/ui/shadcn-io/theme-toggle-button';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { IconLogout } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';
// import { useTheme } from 'next-themes';
import { FC, useEffect } from 'react';
import Diamond from '../../public/icon/diamond';
import Headphone from '../../public/icon/headphone';
import MesssageCircle from '../../public/icon/messsage-circle';
import User from '../../public/icon/user';

export type NavUserProps = {
  user: {
    email: string;
    avatar: string;
  };
};

export const NavUser: FC<NavUserProps> = ({ user }) => {
  const { isMobile } = useSidebar();
  // const { theme, setTheme } = useTheme();
  // const { startTransition } = useThemeTransition();

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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-fit flex items-center"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.email} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="text-paragraph">{user.email}</div>
                <div className="text-tag-label text-[#272727]/50">
                  Free plan
                </div>{' '}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'top'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem>
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Diamond className="h-4 w-4" />
              <span>Upgrade</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Headphone className="h-4 w-4" />
              <span>Feedback</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <MesssageCircle className="h-4 w-4" />
              <span>FAQ</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            {/* <div className="px-2 py-2">
              <div className="text-xs font-medium text-muted-foreground">
                Preferences
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Theme</span>
                <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
                  <ThemeToggleButton
                    theme="light"
                    className={`rounded-full p-1 w-fit h-fit ${
                      theme === 'light' ? 'text-primary' : 'text-gray-400'
                    }`}
                    onClick={() => startTransition(() => setTheme('light'))}
                    variant="circle"
                    start="bottom-left"
                  />
                  <ThemeToggleButton
                    theme="system"
                    className={`rounded-full p-1 w-fit h-fit ${
                      theme === 'system' ? 'text-primary' : 'text-gray-400'
                    }`}
                    onClick={() => startTransition(() => setTheme('system'))}
                    variant="circle"
                    start="bottom-left"
                  />
                  <ThemeToggleButton
                    className={`rounded-full p-1 w-fit h-fit ${
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
            <DropdownMenuSeparator /> */}
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
