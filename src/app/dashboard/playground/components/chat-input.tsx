'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input';
import type { ChatStatus } from 'ai';
import { Paperclip } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, FormEvent, useState } from 'react';
import CloseIcon from '../../../../../public/icon/close';
import ZoanLogo from '../../../../../public/zoan-logo.png';

type ChatInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  submitDisabled?: boolean;
  status?: ChatStatus;
  bannerPosition?: 'top' | 'bottom';
};

export const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  submitDisabled = false,
  status,
  bannerPosition = 'bottom',
}) => {
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Handle input change - allow typing even during AI response
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
  };

  // Handle form submit - check if user is logged in
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!session) {
      e.preventDefault();
      setShowAuthDialog(true);
      return;
    }
    onSubmit(e);
  };

  // Handle sign up
  const handleSignUp = () => {
    // TODO: Implement sign up logic
    console.log('Sign up clicked');
    setShowAuthDialog(false);
  };

  const PASSPORT_BASE_URL =
    process.env.NEXT_PUBLIC_PASSPORT_BASE_URL || 'https://passport.buymed.site';

  const openLoginPopup = () => {
    const popup = window.open(
      `${PASSPORT_BASE_URL}/?clientId=${process.env.NEXT_PUBLIC_PASSPORT_API_KEY}`,
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
    <div className="w-full">
      {showUpgradeBanner && bannerPosition === 'top' && (
        <div className="rounded-t-xl -mb-3 flex items-center justify-between bg-primary-brand-green px-4 pt-3 pb-8 text-paragraph">
          <span>
            {session ? (
              <>
                <span>Upgrade now to get more tokens and unlock access to</span>
                <span className="font-bold"> &nbsp;AI V2</span>
                <span>!</span>
              </>
            ) : (
              <>
                <span>Sign up to explore more our features</span>
              </>
            )}
          </span>
          <span
            className="cursor-pointer text-[#272727]/50"
            onClick={() => setShowUpgradeBanner(false)}
          >
            <CloseIcon />
          </span>
        </div>
      )}
      <PromptInput
        className="z-10 relative rounded-xl border focus-within:border-primary-brand-darker-green bg-card text-card-foreground"
        onSubmit={handleSubmit}
      >
        <PromptInputTextarea
          placeholder="Ask ZOAN to build something amazing"
          className="leading-6 min-h-[72px] border-0 focus:border-0 focus:ring-0 focus:outline-none resize-none w-full bg-transparent text-paragraph text-sm placeholder:text-[#272727]/40"
          style={{ lineHeight: '1.5' }}
          name="message"
          value={value}
          onChange={handleInputChange}
          disabled={submitDisabled}
        />
        <PromptInputToolbar className="px-3 py-2">
          <PromptInputTools>
            <PromptInputButton
              type="button"
              disabled={disabled}
              className="bg-[#2727270D]"
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </PromptInputButton>
          </PromptInputTools>
          <div className="flex items-center gap-2">
            <PromptInputSubmit
              status={status}
              disabled={disabled || submitDisabled || !value.trim()}
            />
          </div>
        </PromptInputToolbar>
      </PromptInput>
      {showUpgradeBanner && bannerPosition === 'bottom' && (
        <div className="rounded-b-xl -mt-3 flex items-center justify-between bg-primary-brand-green px-4 pb-3 pt-7 text-paragraph">
          <span>
            {session ? (
              <>
                <span>Upgrade now to get more tokens and unlock access to</span>
                <span className="font-bold"> &nbsp;AI V2</span>
                <span>!</span>
              </>
            ) : (
              <>
                <span>Sign up to explore more our features</span>
              </>
            )}
          </span>
          <span
            className="cursor-pointer text-[#272727]/50"
            onClick={() => setShowUpgradeBanner(false)}
          >
            <CloseIcon />
          </span>
        </div>
      )}

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md px-4 py-5">
          <DialogHeader className="text-center gap-1">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Image src={ZoanLogo} alt="Zoan" width={32} height={32} />
              <DialogTitle className="text-xl font-semibold mb-0">
                Zoan
              </DialogTitle>
            </div>
            <DialogTitle className="text-[14px] font-medium leading-4 text-center text-[#272727]">
              Continue with ZOAN
            </DialogTitle>
            <DialogDescription className="text-sm leading-3.5 text-center font-normal text-[#272727]/40">
              Please sign in or create an account to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1 mt-6">
            <Button
              onClick={handleSignUp}
              className="flex-1 bg-green-100 hover:bg-green-200 text-black border-0"
            >
              Sign Up
            </Button>
            <Button
              onClick={openLoginPopup}
              variant="outline"
              className="flex-1 bg-white hover:bg-gray-50 text-black border-gray-300"
            >
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
