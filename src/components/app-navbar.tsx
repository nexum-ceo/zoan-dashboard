'use client';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SettingIcon from '../../public/icon/setting';
import ShareIcon from '../../public/icon/share';
import ZoanLogo from '../../public/icon/zoan-logo';
import { Button, buttonVariants } from './ui/button';

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: '#enterprise',
    label: 'Enterprise',
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
    <header className="p-3 sticky top-0 z-40 w-full border-b bg-[#fbfbfb] backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-b-slate-700 dark:bg-background">
      <div className="w-full">
        <div className="flex justify-between">
          <div className="flex justify-between items-center gap-6">
            <Link
              rel="noreferrer noopener"
              href="/"
              className="ml-2 flex items-center gap-2"
            >
              {/* <Image src="/icon.png" alt="Logo" width={32} height={32} /> */}
              <ZoanLogo />
            </Link>
            {/* <nav className="hidden md:flex items-center gap-1"> */}
            {routeList.map((route: RouteProps, i) => (
              <Button className="px-0 py-0" key={i} variant={'tertiary'}>
                {route.label}
              </Button>
            ))}
            {/* </nav> */}
          </div>

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
                <nav className="flex flex-col justify-center items-center mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <Button key={href} variant={'tertiary'}>
                      {label}
                    </Button>
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

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Action buttons matching the image - only show when user is logged in */}
                <div className="flex items-center gap-2">
                  {/* Settings icon button */}
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <SettingIcon />
                  </Button>

                  {/* Share icon button */}
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <ShareIcon />
                  </Button>

                  {/* Share text button */}
                  <Button variant="secondary">Share</Button>

                  {/* Public text button with green background */}
                  <Button
                    variant="default"
                    className="h-8 px-3 bg-green-100 hover:bg-green-200 text-gray-800 border-0"
                  >
                    Public
                  </Button>
                </div>

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
                  <DropdownMenuContent className="w-68" align="end" forceMount>
                    {/* Email Address at top */}
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="text-sm text-[#272727]/50">
                        {user.email}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* General Setting Section */}
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="text-paragraph !text-sm">
                        General setting
                      </div>
                    </DropdownMenuLabel>
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
                      <div className="text-paragraph !text-sm">
                        Credit Balance
                      </div>
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
                            <SelectItem
                              className="text-[#272727]"
                              value="system"
                            >
                              System
                            </SelectItem>
                            <SelectItem className="text-[#272727]" value="dark">
                              Dark
                            </SelectItem>
                            <SelectItem
                              className="text-[#272727]"
                              value="light"
                            >
                              Light
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-paragraph !text-sm !text-[#272727]/50">
                          Language
                        </span>
                        <Select defaultValue={'enlist'} value={'english'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            className="!text-sm !text-[#272727]"
                            defaultValue={'english'}
                          >
                            <SelectItem
                              className="text-[#272727]"
                              value="english"
                            >
                              English
                            </SelectItem>
                            <SelectItem
                              className="text-[#272727]"
                              value="vietnamese"
                            >
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
                            <SelectItem
                              className="text-[#272727]"
                              value="right"
                            >
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant={'secondary'}>Sign up</Button>
                <Button onClick={openLoginPopup}>Log in</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
