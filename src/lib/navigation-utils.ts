import { Bot, LucideIcon, Settings, Users } from 'lucide-react';

export type NavigationItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: (path: string) => boolean;
};

/**
 * Get navigation items for the playground
 */
export const getNavigationItems = (): NavigationItem[] => [
  {
    icon: Bot,
    label: 'Playground',
    href: '/dashboard/playground',
    isActive: (path: string) => path.startsWith('/dashboard/playground'),
  },
  {
    icon: Users,
    label: 'Assistants',
    href: '/dashboard/assistant',
    isActive: (path: string) => path.startsWith('/dashboard/assistant'),
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/setting',
    isActive: (path: string) => path.startsWith('/dashboard/setting'),
  },
];
