'use client';
import { Bot, Plus, Settings, User, Users } from 'lucide-react';

import SelectAssistant from '@/app/dashboard/playground/component/SelectAssistant';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IconBuildingCommunity } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

// Navigation items with dynamic active state
const navigationItems = [
  {
    icon: Bot,
    label: 'Playground',
    href: '/dashboard/playground',
    isActive: (pathname: string) =>
      pathname.startsWith('/dashboard/playground'),
  },
  {
    icon: Users,
    label: 'Assistants',
    href: '/dashboard/assistant',
    isActive: (pathname: string) => pathname.startsWith('/dashboard/assistant'),
  },
  {
    icon: IconBuildingCommunity,
    label: 'Community',
    href: '/dashboard/community',
    isActive: (pathname: string) => pathname.startsWith('/dashboard/community'),
  },
  {
    icon: User,
    label: 'Personal Space',
    href: '/dashboard/personal-space',
    isActive: (pathname: string) =>
      pathname.startsWith('/dashboard/personal-space'),
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/setting',
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
          <div className="h-full bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Image
                    src="/icon.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
                {state !== 'collapsed' && (
                  <h1 className="text-lg font-semibold text-gray-900">
                    Zoan Agent
                  </h1>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="px-3 py-3">
              <div className="mb-6">
                {state === 'collapsed' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => router.push('/dashboard/playground')}
                        className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-medium justify-center px-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>New Chat</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    onClick={() => router.push('/dashboard/playground')}
                    className="text-center w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-medium justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                {state !== 'collapsed' && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Application
                  </div>
                )}
                {navigationItems.map((item, index) => {
                  const isActive = item.isActive(pathname);

                  if (state === 'collapsed') {
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`w-full h-10 text-sm justify-center px-0 ${
                              isActive
                                ? 'bg-gray-100 text-gray-900 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            onClick={() => router.push(item.href)}
                          >
                            <item.icon className="w-4 h-4" />
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
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Content Based on Active Tab */}
            {state !== 'collapsed' && (
              <div className="flex-1 border-t border-gray-100">
                {renderSidebarContent(pathname)}
              </div>
            )}

            {/* Spacer for user and trigger */}
            <div className="flex-1" />

            {/* User Info and Sidebar Trigger */}
            <div className="border-t border-gray-100">
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
