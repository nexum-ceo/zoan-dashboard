'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useEffect, useState } from 'react';

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
import { IconLogout } from '@tabler/icons-react';
import {
  BookOpen,
  DollarSign,
  Menu,
  MessageSquare,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from './ui/button';

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: '#features',
    label: 'Features',
  },
  {
    href: '#testimonials',
    label: 'Testimonials',
  },
  {
    href: '#pricing',
    label: 'Pricing',
  },
  {
    href: '#faq',
    label: 'FAQ',
  },
];

export default function AppNavbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
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

  const openLoginPopup = () => {
    const popup = window.open(
      `https://passport.buymed.site/?clientId=${process.env.NEXT_PUBLIC_PASSPORT_API_KEY}`,
      'LoginPopup',
      'width=850,height=700',
    );

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== `https://passport.buymed.site`) return;

      if (event.data.type === 'login-success') {
        const authCode = event.data.user.authCode;

        if (authCode) {
          const res = await signIn('credentials', {
            authCode,
            redirect: false,
          });

          if (res?.ok) {
            console.log('✅ Logged in');
            router.push('/dashboard/playground');
          } else {
            console.log('❌ Login failed');
          }
        }
      }
    };
    // Add listener
    window.addEventListener('message', handleMessage, false);

    // Clean up
    const timer = setInterval(() => {
      if (popup?.closed) {
        window.removeEventListener('message', handleMessage);
        clearInterval(timer);
      }
    }, 500);
  };

  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <Link
              rel="noreferrer noopener"
              href="/"
              className="ml-2 font-bold text-xl flex items-center"
            >
              <Image src="/icon.png" alt="Logo" width={32} height={32} />
              <span className="ml-2">Zoan AI</span>
            </Link>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden">
            {/* <ModeToggle /> */}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                >
                  Menu Icon
                </Menu>
              </SheetTrigger>

              <SheetContent side={'left'}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">Zoan AI</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: 'ghost' })}
                    >
                      {label}
                    </a>
                  ))}
                  <a
                    rel="noreferrer noopener"
                    href="https://github.com/leoMirandaa/shadcn-landing-page.git"
                    target="_blank"
                    className={`w-[110px] border ${buttonVariants({
                      variant: 'secondary',
                    })}`}
                  >
                    {/* <GitHubLogoIcon className="mr-2 w-5 h-5" /> */}
                    {/* Github */}
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* desktop */}
          <nav className="hidden md:flex gap-2">
            {routeList.map((route: RouteProps, i) => (
              <a
                rel="noreferrer noopener"
                href={route.href}
                key={i}
                className={`text-[17px] ${buttonVariants({
                  variant: 'ghost',
                })}`}
              >
                {route.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user.image || ''}
                        alt={user.email || ''}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user.name?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user?.image || ''}
                          alt={user?.email || ''}
                        />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user.email}
                        </span>
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
                      <div className="flex gap-1 items-center bg-muted rounded-lg p-1">
                        <ThemeToggleButton
                          className={`rounded-full p-1 w-fit h-fit ${
                            theme === 'light' ? 'text-primary' : 'text-gray-400'
                          }`}
                          theme="light"
                          onClick={() =>
                            startTransition(() => setTheme('light'))
                          }
                          variant="circle"
                          start="top-right"
                        />
                        <ThemeToggleButton
                          className={`rounded-full p-1 w-fit h-fit ${
                            theme === 'system'
                              ? 'text-primary'
                              : 'text-gray-400'
                          }`}
                          theme="system"
                          onClick={() =>
                            startTransition(() => setTheme('system'))
                          }
                          variant="circle"
                          start="top-right"
                        />
                        <ThemeToggleButton
                          className={`rounded-full p-1 w-fit h-fit ${
                            theme === 'dark' ? 'text-primary' : 'text-gray-400'
                          }`}
                          theme="dark"
                          onClick={() =>
                            startTransition(() => setTheme('dark'))
                          }
                          variant="circle"
                          start="top-right"
                        />
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <IconLogout className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={openLoginPopup}
                className={`border ${buttonVariants({ variant: 'secondary' })}`}
              >
                Login With Zoan Passport
              </Button>
            )}
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
