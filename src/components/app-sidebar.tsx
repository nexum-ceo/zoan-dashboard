'use client';
import { Bot, Plus, Settings, Users } from 'lucide-react';

import SelectAssistant from '@/app/dashboard/playground/component/SelectAssistant';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { useAgent } from '@/contexts/AgentContext';
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
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/setting',
    isActive: (pathname: string) => pathname.startsWith('/dashboard/setting'),
  },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { selectedAgentId, setSelectedAgentId } = useAgent();
  // Get user data directly from session
  const user = session?.user;

  return (
    <Sidebar collapsible="icon" variant="floating">
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
              <h1 className="text-lg font-semibold text-gray-900">
                Zoan Agent
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-3">
            <div className="mb-6">
              <Button
                onClick={() => router.push('/dashboard/playground')}
                className="w-full justify-start gap-3 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-medium"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Application
              </div>
              {navigationItems.map((item, index) => {
                const isActive = item.isActive(pathname);
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-10 text-sm ${
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

          {/* Assistant Selection */}
          <div className="flex-1 px-3 py-2 border-t border-gray-100">
            <SelectAssistant
              value={selectedAgentId}
              onAgentChange={setSelectedAgentId}
              activeChatId=""
            />
          </div>

          {/* User Info */}
          <div className="border-t border-gray-100">
            <NavUser
              user={{
                email: user?.email || '',
                avatar: '/avatar-placeholder.png',
              }}
            />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
