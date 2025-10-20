'use client';

import TopCreators from '@/app/(public)/components/top-creators';
import CommunitySection from '@/app/dashboard/playground/components/community';
import PersonalSpace from '@/app/dashboard/playground/components/personal-space';
import { DragDropOverlay } from '@/components/ui/drag-drop-overlay';
import OptionButtons from '@/components/ui/option-buttons';
import { DragDropProvider, useDragDrop } from '@/contexts/DragDropContext';
import { useSSEChat } from '@/hooks/system/useSSEChat';
// Pending attachment metadata is handled within ChatInput using IndexedDB
import { handleErrorApi } from '@/lib/utils';
import { useCreateChatMutation } from '@/queries/useChat';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PlaygroundInput } from './playground-input';
import { PlaygroundMessages } from './playground-messages';

function PlaygroundClientInner() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { messages, handleSubmit, isLoading, isProcessing } = useSSEChat({
    initialMessages: [],
    chatId: '',
    user_id: '',
  });

  // State for pending first message and attachments
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [, setAttachments] = useState<
    Array<{
      url: string;
      mime_type: string;
      file_name: string;
      file_size: number;
      file?: File; // Store File object for later upload
    }>
  >([]);
  const createChatMutation = useCreateChatMutation();
  const router = useRouter();

  // Drag and drop wiring via shared context
  const { setIsDragActive, onFilesDropped } = useDragDrop();
  const { getRootProps } = useDropzone({
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDrop: (acceptedFiles) => {
      setIsDragActive(false);
      if (acceptedFiles.length > 0 && onFilesDropped) {
        onFilesDropped(acceptedFiles);
      }
    },
    noClick: true,
    noKeyboard: true,
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'text/*': ['.txt', '.md', '.json', '.xml', '.csv'],
      'application/json': ['.json'],
      'text/javascript': ['.js', '.jsx', '.ts', '.tsx'],
      'text/css': ['.css'],
      'text/html': ['.html', '.htm'],
    },
  });

  const handleFirstSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pendingMessage.trim()) return;

    createChatMutation.mutate(
      {
        title: pendingMessage,
      },
      {
        onSuccess: (data) => {
          const chatId = data.data.data.id;
          localStorage.setItem('pendingMessage', pendingMessage);
          router.push(`/dashboard/playground/${chatId}`);
        },
        onError: (error) => {
          handleErrorApi({ error });
        },
      },
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle files uploaded from drag drop or file picker
  const handleFilesUploaded = (
    files: Array<{
      id: string;
      file: File;
      progress: number;
      status: 'completed' | 'uploading' | 'error';
      url?: string;
      error?: string;
    }>,
  ) => {
    // For playground without chatId, we persist pending files (completed OR uploading)
    // We require a preview URL to restore in the next screen.
    const newAttachments = files
      .filter((f) => f.status !== 'error' && !!f.url)
      .map((f) => ({
        url: f.url!, // blob: URL preview or real URL if already uploaded
        mime_type: f.file.type,
        file_name: f.file.name,
        file_size: f.file.size,
        // Keep File in memory state (will be stripped in localStorage JSON, which is OK)
        file: f.file,
      }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  return (
    // Main Chat Area under drag-drop root props
    <div
      {...getRootProps()}
      className="flex-1 flex flex-col items-center py-20 bg-white"
    >
      <div className="px-25 py-20 pb-6 max-w-7xl w-full">
        {/* Messages */}
        <PlaygroundMessages
          messages={messages}
          isLoading={isLoading}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef}
          showScrollButton={false}
          onScrollToBottom={scrollToBottom}
        />

        {/* Input Area */}
        <PlaygroundInput
          value={pendingMessage}
          onChange={(e) => setPendingMessage(e.target.value)}
          onSubmit={messages.length === 0 ? handleFirstSubmit : handleSubmit}
          disabled={false}
          submitDisabled={isProcessing}
          onFilesUploaded={handleFilesUploaded}
          initialAttachments={[]}
        />

        {/* AI Suggestion */}
        <div className="mt-6">
          <OptionButtons />
        </div>
      </div>

      <div className="py-20 pt-6 w-full max-w-7xl">
        {/** --- Personal Space Section ---  */}
        <PersonalSpace />

        {/** --- Community Section ---  */}
        <CommunitySection />

        {/** --- Top Creators Section ---  */}
        <TopCreators />
      </div>

      {/* Drag Drop Overlay */}
      <DragDropOverlay />
    </div>
  );
}

export function PlaygroundClient() {
  return (
    <DragDropProvider>
      <PlaygroundClientInner />
    </DragDropProvider>
  );
}
