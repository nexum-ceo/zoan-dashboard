'use client';

import { AttachedFiles } from '@/components/ui/attached-files';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { UploadedFile } from '@/components/ui/file-upload';
import { InlineFileUpload } from '@/components/ui/inline-file-upload';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input';
import type { ChatStatus } from 'ai';
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
  onFilesUploaded?: (files: UploadedFile[]) => void;
};

export const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  submitDisabled = false,
  status,
  bannerPosition = 'bottom',
  onFilesUploaded,
}) => {
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
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

  // Handle files selected from inline upload
  const handleFilesSelected = async (files: FileList) => {
    if (!session?.user?.id) {
      setShowAuthDialog(true);
      return;
    }

    const fileArray = Array.from(files);
    const newUploadedFiles: UploadedFile[] = fileArray.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading',
    }));

    setAttachedFiles((prev) => [...prev, ...newUploadedFiles]);

    // Upload files
    try {
      const uploadPromises = fileArray.map((file) => uploadFile(file));
      const completedFiles = await Promise.all(uploadPromises);

      // Update the attached files with completed uploads
      setAttachedFiles((prev) =>
        prev.map((f) => {
          const completed = completedFiles.find(
            (cf) => cf.file.name === f.file.name,
          );
          return completed ? completed : f;
        }),
      );

      onFilesUploaded?.(completedFiles);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // Upload file function
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const uploadedFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading',
    };

    try {
      // Generate unique file path
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${session!.user!.id}/${fileName}`;

      // Get presigned URL
      const presignedResponse = await fetch('/api/library/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_list: [
            {
              path: filePath,
              file_name: fileName,
            },
          ],
        }),
      });

      const presignedData = await presignedResponse.json();

      if (
        !presignedData.data ||
        !Array.isArray(presignedData.data) ||
        presignedData.data.length === 0
      ) {
        throw new Error('Failed to get presigned URL');
      }

      const presignedUrl = presignedData.data[0]?.presigned_url;
      if (!presignedUrl) {
        throw new Error('Invalid presigned URL response');
      }

      // Upload file using presigned URL with progress tracking
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setAttachedFiles((prev) =>
              prev.map((f) =>
                f.file.name === file.name ? { ...f, progress } : f,
              ),
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || '';
            const fileUrl = `${baseUrl}/library/${filePath}`;

            setAttachedFiles((prev) =>
              prev.map((f) =>
                f.file.name === file.name
                  ? { ...f, progress: 100, status: 'completed', url: fileUrl }
                  : f,
              ),
            );

            resolve({
              ...uploadedFile,
              progress: 100,
              status: 'completed',
              url: fileUrl,
            });
          } else {
            throw new Error(`Upload failed with status: ${xhr.status}`);
          }
        });

        xhr.addEventListener('error', () => {
          setAttachedFiles((prev) =>
            prev.map((f) =>
              f.file.name === file.name
                ? {
                    ...f,
                    status: 'error',
                    error: 'Network error during upload',
                  }
                : f,
            ),
          );
          reject(new Error('Network error during upload'));
        });

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (error) {
      setAttachedFiles((prev) =>
        prev.map((f) =>
          f.file.name === file.name
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : f,
        ),
      );
      throw error;
    }
  };

  // Remove attached file
  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
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
      <div className="z-10 relative rounded-xl border focus-within:border-primary-brand-darker-green bg-card text-card-foreground">
        {/* Attached Files */}
        <AttachedFiles files={attachedFiles} onRemoveFile={handleRemoveFile} />

        <PromptInput onSubmit={handleSubmit}>
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
              <InlineFileUpload onFilesSelected={handleFilesSelected} />
            </PromptInputTools>
            <div className="flex items-center gap-2">
              <PromptInputSubmit
                status={status}
                disabled={
                  disabled ||
                  submitDisabled ||
                  (!value.trim() && attachedFiles.length === 0)
                }
              />
            </div>
          </PromptInputToolbar>
        </PromptInput>
      </div>
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
