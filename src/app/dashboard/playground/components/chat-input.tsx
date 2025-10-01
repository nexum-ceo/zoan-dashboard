'use client';

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
import { useDragDrop } from '@/contexts/DragDropContext';
import { getMediaTypeFromFilename } from '@/lib/s3';
import { useGetChatPresignedUrl } from '@/queries/useChat';
import type { ChatStatus } from 'ai';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChangeEvent,
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import CloseIcon from '../../../../../public/icon/close';
import ZoanLogo from '../../../../../public/zoan-logo.png';

const MAX_FILES_PER_MESSAGE = 5;

type ChatInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  submitDisabled?: boolean;
  status?: ChatStatus;
  bannerPosition?: 'top' | 'bottom';
  onFilesUploaded?: (files: UploadedFile[]) => void;
  chatId?: string;
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
  chatId,
}) => {
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const { data: session } = useSession();
  const router = useRouter();
  const uploadMutation = useGetChatPresignedUrl(chatId || '');
  const { setOnFilesDropped } = useDragDrop();
  const handleFilesSelectedRef = useRef<
    ((files: FileList) => Promise<void>) | null
  >(null);

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

  // Upload files function using batch API call
  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadedFile[]> => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate file list for API
      const fileList = files.map((file) => {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        return {
          file_name: fileName,
          file_type: file.type,
          file_size: file.size,
        };
      });

      try {
        // Get presigned URLs for all files in one API call
        const presignedData = await uploadMutation.mutateAsync({
          file_list: fileList,
        });

        // Try nested data structure first
        const actualData = presignedData.data?.data || presignedData.data;

        if (
          !actualData ||
          !Array.isArray(actualData) ||
          actualData.length === 0
        ) {
          console.error('Invalid presigned data:', presignedData);
          throw new Error('Failed to get presigned URLs');
        }

        // Upload each file using its presigned URL
        const uploadPromises = files.map(async (file, index) => {
          const presignedItem = actualData[index];
          if (!presignedItem?.presigned_url) {
            throw new Error(`Invalid presigned URL for file: ${file.name}`);
          }

          const response = await fetch(presignedItem.presigned_url, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
              'Content-Length': file.size.toString(),
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Upload failed for ${file.name} with status: ${response.status} - ${errorText}`,
            );
          }

          // Use object_key from response for file URL
          const objectKey = presignedItem.object_key;
          const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL || '';
          const fileUrl = objectKey
            ? `${baseUrl}/${objectKey.bucket}/${objectKey.key}`
            : `${baseUrl}/library/${session!.user!.id}/${
                fileList[index].file_name
              }`;

          return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            progress: 100,
            status: 'completed' as const,
            url: fileUrl,
          };
        });

        const completedFiles = await Promise.all(uploadPromises);
        return completedFiles;
      } catch (error) {
        throw error;
      }
    },
    [session, uploadMutation],
  );

  // Handle files selected from inline upload
  const handleFilesSelected = useCallback(
    async (files: FileList) => {
      if (!session?.user?.id) {
        setShowAuthDialog(true);
        return;
      }

      const fileArray = Array.from(files);

      // Check if adding these files would exceed the limit
      const currentFileCount = attachedFiles.length;
      const newFileCount = fileArray.length;
      const totalFileCount = currentFileCount + newFileCount;

      if (totalFileCount > MAX_FILES_PER_MESSAGE) {
        const remainingSlots = MAX_FILES_PER_MESSAGE - currentFileCount;
        if (remainingSlots <= 0) {
          toast.error('File limit reached', {
            description: `You can only upload a maximum of ${MAX_FILES_PER_MESSAGE} files per message. Please remove some files first.`,
          });
          return;
        } else {
          toast.warning('File limit warning', {
            description: `You can only upload ${remainingSlots} more file(s). Maximum ${MAX_FILES_PER_MESSAGE} files per message.`,
          });
          // Only take the first N files that fit within the limit
          const filesToUpload = fileArray.slice(0, remainingSlots);
          const dataTransfer = new DataTransfer();
          filesToUpload.forEach((file) => dataTransfer.items.add(file));
          return handleFilesSelected(dataTransfer.files);
        }
      }

      const newUploadedFiles: UploadedFile[] = fileArray.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'uploading',
        // Create preview URL for images immediately
        url:
          getMediaTypeFromFilename(file.name) === 'image'
            ? URL.createObjectURL(file)
            : undefined,
      }));

      setAttachedFiles((prev) => [...prev, ...newUploadedFiles]);

      // Upload files using batch upload
      try {
        const completedFiles = await uploadFiles(fileArray);

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
        // Mark all files as error
        setAttachedFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Upload failed',
          })),
        );
      }
    },
    [session, uploadFiles, onFilesUploaded, attachedFiles],
  );

  // Update ref when function changes
  useEffect(() => {
    handleFilesSelectedRef.current = handleFilesSelected;
  }, [handleFilesSelected]);

  // Set up file handler for drag drop context
  useEffect(() => {
    const processDroppedFiles = async (files: File[]) => {
      try {
        if (handleFilesSelectedRef.current) {
          for (const file of files) {
            const fileList = new DataTransfer();
            fileList.items.add(file);
            await handleFilesSelectedRef.current(fileList.files);
          }
        }
      } catch (error) {
        console.error('Error processing dropped files:', error);
      }
    };

    setOnFilesDropped(processDroppedFiles);
  }, [setOnFilesDropped]);

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
        <PromptInput
          onSubmit={handleSubmit}
          attachedFiles={attachedFiles.map((file) => ({
            id: file.id,
            file: file.file,
            url: file.url,
            onRemove: handleRemoveFile,
          }))}
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
