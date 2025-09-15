'use client';
import { Settings, User, Users } from 'lucide-react';

import { SelectAssistant } from '@/app/dashboard/playground/components';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AddPlusSquare from '../../public/icon/add-plus-square';
import FileBlank from '../../public/icon/file-blank';
import Globe from '../../public/icon/globe';
import Search from '../../public/icon/search';
import TicketVoucher from '../../public/icon/ticket-voucher';
import UserIcon from '../../public/icon/user';

// Navigation items with dynamic active state
const navigationItems = [
  {
    icon: TicketVoucher,
    label: 'Princing',
    href: '/dashboard/playground',
    isShow: true,
    isActive: (pathname: string) =>
      pathname.startsWith('/dashboard/playground'),
  },
  {
    icon: Users,
    label: 'Assistants',
    href: '/dashboard/assistant',
    isShow: false,
    isActive: (pathname: string) => pathname.startsWith('/dashboard/assistant'),
  },
  {
    icon: FileBlank,
    label: 'Projects',
    href: '/dashboard/projects',
    isShow: true,
    isActive: (pathname: string) =>
      pathname.startsWith('/dashboard/documentation'),
  },
  {
    icon: Globe,
    label: 'Community',
    href: '/dashboard/community',
    isShow: true,
    isActive: (pathname: string) => pathname.startsWith('/dashboard/community'),
  },
  {
    icon: UserIcon,
    label: 'Personal Space',
    href: '/dashboard/personal-space',
    isShow: true,
    isActive: (pathname: string) =>
      pathname.startsWith('/dashboard/personal-space'),
  },
  {
    icon: User,
    label: 'Library',
    href: '/dashboard/library',
    isShow: false,
    isActive: (pathname: string) => pathname.startsWith('/dashboard/library'),
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/setting',
    isShow: false,
    isActive: (pathname: string) => pathname.startsWith('/dashboard/setting'),
  },
];

// Function to render dynamic sidebar content based on current route
const renderSidebarContent = (pathname: string) => {
  if (pathname.startsWith('/dashboard/playground')) {
    return (
      <div className="px-3 py-2">
        <SelectAssistant activeChatId="" />
      </div>
    );
  }

  if (pathname.startsWith('/dashboard/assistant')) {
    return (
      <div className="px-3 py-4 text-center text-gray-500 text-sm">
        Assistant management context
        <br />
        <span className="text-xs">(Coming soon)</span>
      </div>
    );
  }

  if (pathname.startsWith('/dashboard/community')) {
    return (
      <div className="px-3 py-4 text-center text-gray-500 text-sm">
        Community context
        <br />
        <span className="text-xs">(Coming soon)</span>
      </div>
    );
  }

  if (pathname.startsWith('/dashboard/setting')) {
    return (
      <div className="px-3 py-4 text-center text-gray-500 text-sm">
        Settings context
        <br />
        <span className="text-xs">(Coming soon)</span>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 text-center text-gray-500 text-sm">
      Select a section
    </div>
  );
};

export function AppSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const user = session?.user;
  const { state } = useSidebar();

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" variant="floating" className="rounded-none">
        <SidebarContent>
          <div className="h-full bg-background flex flex-col w-full">
            {/* Header */}
            <div className="p-3 dark:border-sidebar-border w-full">
              <div className="flex items-center justify-between w-full">
                <Link
                  href="/"
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                >
                  <Image
                    src="/zoan-logo.png"
                    alt="Logo"
                    width={28}
                    height={28}
                    className="rounded-lg"
                  />
                </Link>
                <SidebarTrigger className="w-4 h-4 text-[#272727]" />
              </div>
            </div>

            {/* Navigation */}
            <div className="px-3 py-2">
              <div className="space-y-2">
                {/* Search Input */}
                {state === 'collapsed' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-10 justify-center px-0"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#272727]" />
                        <Input
                          placeholder="Search"
                          className="pl-10 w-48 bg-gray-100 border-0 rounded-lg"
                        />
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#272727]" />
                    <Input
                      placeholder="Search"
                      className="w-full h-10 pl-10 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                    />
                  </div>
                )}

                {/* New Chat Button */}
                {state === 'collapsed' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => router.push('/dashboard/playground')}
                        className="w-full h-10 bg-gray-100 dark:bg-sidebar-accent hover:bg-gray-200 dark:hover:bg-sidebar-accent/80 text-gray-700 dark:text-sidebar-accent-foreground border-0 font-medium justify-center px-0"
                      >
                        <AddPlusSquare className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>New Chat</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    onClick={() => router.push('/dashboard/playground')}
                    className="w-full py-3 text-sm font-medium"
                  >
                    <AddPlusSquare className="w-4 h-4 stroke-[#272727]" />
                    New Chat
                  </Button>
                )}
              </div>
            </div>
            <SidebarSeparator className="my-3 w-full mx-0" />
            <div className="px-3">
              <div className="space-y-1">
                {navigationItems
                  .filter((item) => item.isShow)
                  .map((item, index) => {
                    const isActive = item.isActive(pathname);

                    if (state === 'collapsed') {
                      return (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className={`w-full h-10 text-sm justify-center px-0 ${
                                isActive
                                  ? 'bg-[#272727]/5 dark:bg-sidebar-accent text-[#272727] dark:text-sidebar-accent-foreground font-medium'
                                  : 'text-[#272727]/50 dark:text-sidebar-foreground/70 hover:bg-gray-50 dark:hover:bg-sidebar-accent/40 hover:text-gray-900 dark:hover:text-sidebar-accent-foreground'
                              }`}
                              onClick={() => router.push(item.href)}
                            >
                              <item.icon className="w-4 h-4 stroke-[#272727]" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className={`w-full h-10 text-sm justify-start gap-3 ${
                          isActive
                            ? 'bg-[#272727]/5 dark:bg-sidebar-accent text-[#272727] dark:text-sidebar-accent-foreground font-medium'
                            : 'text-[#272727]/50 dark:text-sidebar-foreground/70 hover:bg-gray-50 dark:hover:bg-sidebar-accent/40 hover:text-gray-900 dark:hover:text-sidebar-accent-foreground'
                        }`}
                        onClick={() => router.push(item.href)}
                      >
                        <item.icon className="w-4 h-4 stroke-[#272727]" />
                        {item.label}
                      </Button>
                    );
                  })}
              </div>
            </div>

            <SidebarSeparator className="my-3 w-full mx-0" />
            {/* Dynamic Content Based on Active Tab */}
            {state !== 'collapsed' && (
              <div className="">{renderSidebarContent(pathname)}</div>
            )}

            {/* Spacer for user and trigger */}
            <div className="flex-1" />

            {/* User Info and Sidebar Trigger */}
            <div className="border-t border-sidebar-border">
              {state === 'collapsed' ? (
                // When collapsed: Avatar on top, Trigger below
                <div className="p-4 space-y-3">
                  {/* Avatar */}
                  <NavUser
                    user={{
                      email: user?.email || '',
                      avatar: '/avatar-placeholder.png',
                    }}
                  />
                  {/* Sidebar Trigger */}
                  <div className="flex justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarTrigger className="h-8 w-8" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Toggle Sidebar (Ctrl + B)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ) : (
                // When not collapsed: NavUser and Trigger below
                <div className="space-y-3 flex items-center">
                  <NavUser
                    user={{
                      email: user?.email || '',
                      avatar: '/avatar-placeholder.png',
                    }}
                  />
                  {/* Sidebar Trigger at the bottom */}
                  <SidebarTrigger size={'lg'} />
                </div>
              )}
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}
