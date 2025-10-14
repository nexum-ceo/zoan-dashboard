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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SelectItem } from '@radix-ui/react-select';
import {
  BookOpen,
  DollarSign,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import { FC, useEffect } from 'react';
import User from '../../../public/icon/user';

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
            <DropdownMenuItem className="px-3 py-2 bg-gray-100 cursor-pointer">
              <User className="mr-2 h-4 w-4 text-[#272727]" />
              <span className="text-paragraph !text-sm">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="px-3 py-2 cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-[#272727]" />
              <span className="text-paragraph !text-sm !text-[#272727]/50">
                Settings
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="px-3 py-2 cursor-pointer">
              <DollarSign className="mr-2 h-4 w-4 text-[#272727]" />
              <span className="text-paragraph !text-sm !text-[#272727]/50">
                Pricing
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="px-3 py-2 cursor-pointer">
              <BookOpen className="mr-2 h-4 w-4 !text-[#272727]" />
              <span className="text-paragraph !text-sm !text-[#272727]/50">
                Documentation
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="px-3 py-2 cursor-pointer">
              <Users className="mr-2 h-4 w-4 text-[#272727]" />
              <span className="text-paragraph !text-sm !text-[#272727]/50">
                Community Forum
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="px-3 py-2 cursor-pointer">
              <MessageSquare className="mr-2 h-4 w-4 text-[#272727]" />
              <span className="text-paragraph !text-sm !text-[#272727]/50">
                Feedback
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Credit Balance Section */}
            <DropdownMenuLabel className="px-3 py-2">
              <div className="text-paragraph !text-sm">Credit Balance</div>
            </DropdownMenuLabel>
            <div className="px-3 py-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-paragraph !text-sm !text-[#272727]/50">
                  Gifted credits
                </span>
                <span className="text-paragraph !text-sm">0.00</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-paragraph !text-sm !text-[#272727]/50">
                  Monthly credits
                </span>
                <span className="text-paragraph !text-sm">4.71</span>
              </div>
            </div>
            {/* Upgrade Banner */}
            <div className="bg-primary-brand-green rounded-lg px-3 py-2">
              <span className="text-paragraph !text-sm  !text-primary-brand-darker-green">
                Upgrade your plan to buy more credits.
                <span className="underline underline-offset-2">
                  Upgrade plan
                </span>
              </span>
            </div>
            <DropdownMenuSeparator />
            {/* Preferences Section */}
            <DropdownMenuLabel className="px-3 py-2">
              <div className="text-paragraph !text-sm">Preferences</div>
            </DropdownMenuLabel>
            <div className="px-3 py-2">
              <div className="flex justify-between items-center mb-3">
                <span className="text-paragraph !text-sm !text-[#272727]/50">
                  Theme
                </span>
                <Select defaultValue={'system'} value={'system'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="!text-sm !text-[#272727]"
                    defaultValue={'system'}
                  >
                    <SelectItem className="text-[#272727]" value="system">
                      System
                    </SelectItem>
                    <SelectItem className="text-[#272727]" value="dark">
                      Dark
                    </SelectItem>
                    <SelectItem className="text-[#272727]" value="light">
                      Light
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-paragraph !text-sm !text-[#272727]/50">
                  Language
                </span>
                <Select defaultValue={'enlish'} value={'english'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="!text-sm !text-[#272727]"
                    defaultValue={'english'}
                  >
                    <SelectItem className="text-[#272727]" value="english">
                      English
                    </SelectItem>
                    <SelectItem className="text-[#272727]" value="vietnamese">
                      Vietnamese
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-paragraph !text-sm !text-[#272727]/50">
                  Chat Position
                </span>
                <Select defaultValue={'left'} value="left">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="!text-sm !text-[#272727]"
                    defaultValue={'left'}
                  >
                    <SelectItem className="text-[#272727]" value="left">
                      Left
                    </SelectItem>
                    <SelectItem className="text-[#272727]" value="right">
                      Right
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DropdownMenuSeparator />
            {/* Sign Out Button */}
            <DropdownMenuItem onClick={handleLogout}>
              <Button className="w-full text-[#ef3d40] bg-transparent hover:bg-transparent p-0 border-none shadow-none">
                <IconLogout className="text-[#ef3d40]" />
                Sign out
              </Button>
            </DropdownMenuItem>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
