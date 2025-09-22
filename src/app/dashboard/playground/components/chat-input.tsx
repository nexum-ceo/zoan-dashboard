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
import { useSession } from 'next-auth/react';
import { ChangeEvent, FC, FormEvent, useState } from 'react';
import CloseIcon from '../../../../../public/icon/close';

type ChatInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  submitDisabled?: boolean;
  status?: ChatStatus;
};

export const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  submitDisabled = false,
  status,
}) => {
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { data: session } = useSession();

  // Handle input change with disabled state check
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return; // Prevent input when disabled
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

  // Handle sign in
  const handleSignIn = () => {
    // TODO: Implement sign in logic
    console.log('Sign in clicked');
    setShowAuthDialog(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      <PromptInput
        className="z-10 relative rounded-xl border focus-within:border-primary-brand-darker-green bg-card text-card-foreground"
        onSubmit={handleSubmit}
      >
        <PromptInputTextarea
          placeholder="Ask ZOAN to build something amazing"
          className={`leading-6 min-h-[72px] border-0 focus:border-0 focus:ring-0 focus:outline-none resize-none w-full bg-transparent text-paragraph text-sm placeholder:text-[#272727]/40 ${
            disabled ? 'opacity-50' : ''
          }`}
          style={{ lineHeight: '1.5' }}
          name="message"
          value={value}
          onChange={handleInputChange}
        />
        <PromptInputToolbar className="px-3 py-2">
          <PromptInputTools>
            <PromptInputButton
              type="button"
              disabled={disabled}
              className={`bg-[#2727270D] ${disabled ? 'opacity-50' : ''}`}
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </PromptInputButton>
          </PromptInputTools>
          <div className="flex items-center gap-2">
            <PromptInputSubmit
              status={status}
              disabled={disabled || submitDisabled || !value.trim()}
            >
              <span className="px-1">»»</span>
            </PromptInputSubmit>
          </div>
        </PromptInputToolbar>
      </PromptInput>
      {showUpgradeBanner && (
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <DialogTitle className="text-xl font-semibold">Zoan</DialogTitle>
            </div>
            <DialogTitle className="text-lg font-semibold mb-2">
              Continue with ZOAN
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Please sign in or create an account to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSignUp}
              className="flex-1 bg-green-100 hover:bg-green-200 text-black border-0"
            >
              Sign Up
            </Button>
            <Button
              onClick={handleSignIn}
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
