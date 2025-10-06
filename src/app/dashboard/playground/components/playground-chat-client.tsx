'use client';

import { SelectAssistant } from '@/app/dashboard/playground/components';
import { ChatInput } from '@/app/dashboard/playground/components/chat-input';
import { ChatMessage } from '@/app/dashboard/playground/components/chat-message';
import { ChatSettings } from '@/app/dashboard/playground/components/chat-setting';
import { ExplorePanel } from '@/app/dashboard/playground/components/explore';

import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import { DragDropOverlay } from '@/components/ui/drag-drop-overlay';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DragDropProvider, useDragDrop } from '@/contexts/DragDropContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useSSEChat } from '@/hooks/useSSEChat';
import {
  clearPendingMessage,
  getPendingMessage,
  transformChatMessages,
} from '@/lib/chat-utils';
import { getNavigationItems } from '@/lib/navigation-utils';
import { useGetChat, useGetChatMessagesInfinite } from '@/queries/useChat';
import { ChatRole } from '@/types/chat';
import { Menu, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import SettingIcon from '../../../../../public/icon/setting';
import ShareIcon from '../../../../../public/icon/share';

type PlaygroundChatClientProps = {
  chatId: string;
};

// Inner component that uses drag drop context
function PlaygroundChatClientInner({ chatId }: PlaygroundChatClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<
    Array<{
      url: string;
      mime_type: string;
      file_name: string;
      file_size: number;
    }>
  >([]);
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [exploreOpen, setExploreOpen] = useState<boolean>(false);
  const [isExploreExpanded, setIsExploreExpanded] = useState<boolean>(false);
  const gameSignalListenerRef =
    useRef<(e: Event) => void | undefined>(undefined);

  // Drag drop context
  const { setIsDragActive, onFilesDropped } = useDragDrop();

  // Setup dropzone
  const { getRootProps } = useDropzone({
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDrop: (acceptedFiles) => {
      setIsDragActive(false);
      if (acceptedFiles.length > 0 && onFilesDropped) {
        onFilesDropped(acceptedFiles);
      }
    },
    noClick: true, // Disable click to open file dialog
    noKeyboard: true, // Disable keyboard navigation
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

  // Get the first message from localStorage if it exists
  const [pendingMsg, setPendingMsg] = useState<string>(() =>
    getPendingMessage(),
  );
  const [firstMsgSent, setFirstMsgSent] = useState<boolean>(false);
  const [previousScrollHeight, setPreviousScrollHeight] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const { data: chatData } = useGetChat(chatId);
  const {
    data: chatMessageData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetChatMessagesInfinite(chatId);

  const chatMessages = chatMessageData?.pages.flatMap((page) => page.data.data);
  const chatInfo = chatData?.data?.data;

  const exploreRefetchRef = useRef<(() => void) | null>(null);

  // Transform API messages to use as initial messages
  const initialMessages = useMemo(() => {
    if (
      chatInfo?.user_id &&
      Array.isArray(chatMessages) &&
      chatMessages.length > 0
    ) {
      return transformChatMessages(chatMessages, chatInfo.user_id);
    }
    return [];
  }, [chatInfo?.user_id, chatMessages]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isAssistantStreaming,
    postMessage,
    canType,
    canSubmit,
    status,
    setMessages,
  } = useSSEChat({
    initialMessages,
    chatId: chatId,
    user_id: chatInfo?.user_id || '',
    onGameSignal: () => {
      setExploreOpen(true);
    },
    attachments,
  });

  // Fallback listener to ensure Explore opens even if callback path breaks
  useEffect(() => {
    const handler = () => {
      setExploreOpen(true);
    };
    gameSignalListenerRef.current = handler;
    if (typeof window !== 'undefined') {
      window.addEventListener('zoan:game-signal', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined' && gameSignalListenerRef.current) {
        window.removeEventListener(
          'zoan:game-signal',
          gameSignalListenerRef.current as EventListener,
        );
      }
    };
  }, []);

  // Use ref to store functions to avoid dependency issues
  const postMessageRef = useRef(postMessage);
  const setMessagesRef = useRef(setMessages);
  const isFirstMessageSendingRef = useRef(false);

  // Update refs in useEffect to avoid re-render issues
  useEffect(() => {
    postMessageRef.current = postMessage;
    setMessagesRef.current = setMessages;
  }, [postMessage, setMessages]);

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
    const newAttachments = files
      .filter((file) => file.status === 'completed' && file.url)
      .map((file) => ({
        url: file.url!,
        mime_type: file.file.type,
        file_name: file.file.name,
        file_size: file.file.size,
      }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  // Clear attachments after message is sent
  const handleSubmitWithAttachments = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e);
    // Clear attachments after sending
    setAttachments([]);
  };

  // Send the first message with delay for new chats
  useEffect(() => {
    // Require user_id to be available before attempting first send
    if (!chatInfo?.user_id) return;
    if (pendingMsg && !firstMsgSent && !isFirstMessageSendingRef.current) {
      // Set flags immediately to prevent multiple executions
      setFirstMsgSent(true);
      isFirstMessageSendingRef.current = true;

      // Add user message to UI first
      const userMsg = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: pendingMsg,
        sender_id: chatInfo.user_id,
      };
      setMessagesRef.current((prev) => [...prev, userMsg]);

      // Wait a bit for chat to be fully initialized, then send message
      const sendFirstMessage = async () => {
        try {
          // Wait 1-2 seconds for chat initialization
          await new Promise((resolve) => setTimeout(resolve, 1500));

          await postMessageRef.current(pendingMsg);
          setPendingMsg('');
          clearPendingMessage();
        } catch (error) {
          console.error('First message failed:', error);
          // Still clear the pending message even if it fails
          setPendingMsg('');
          clearPendingMessage();
        } finally {
          isFirstMessageSendingRef.current = false;
        }
      };

      sendFirstMessage();
    }
  }, [pendingMsg, firstMsgSent, chatInfo?.user_id]);

  // Sync fetched initial messages into UI state on first load
  useEffect(() => {
    if (
      Array.isArray(initialMessages) &&
      initialMessages.length > 0 &&
      messages.length === 0 &&
      !isAssistantStreaming &&
      !isLoading
    ) {
      setMessages(initialMessages);
    }
  }, [
    initialMessages,
    messages.length,
    isAssistantStreaming,
    isLoading,
    setMessages,
  ]);

  // Infinite scroll functionality
  useInfiniteScroll({
    containerRef: messagesContainerRef,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage: !!isFetchingNextPage,
    isLoadingMore,
    onFetchNextPage: () => {
      setIsLoadingMore(true);
      fetchNextPage().finally(() => {
        setIsLoadingMore(false);
      });
    },
    onScrollHeightChange: setPreviousScrollHeight,
  });

  // Restore scroll position after new messages are loaded
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !isFetchingNextPage || previousScrollHeight === 0) return;

    // Wait for DOM to update with new messages
    const timeoutId = setTimeout(() => {
      const newScrollHeight = container.scrollHeight;
      const scrollDifference = newScrollHeight - previousScrollHeight;

      // Adjust scroll position to maintain user's view
      container.scrollTop = container.scrollTop + scrollDifference;
      setPreviousScrollHeight(0); // Reset
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isFetchingNextPage, previousScrollHeight]);

  // Open Explore on initial load if existing history has game_generator reasoning
  useEffect(() => {
    if (!Array.isArray(initialMessages) || initialMessages.length === 0) return;
    const found = [...(initialMessages as Array<Record<string, unknown>>)]
      .reverse()
      .find((m) => {
        const role = (m?.role as string) || '';
        const isAssistant = role === 'assistant' || role === 'ASSISTANT';
        const reasoning =
          (m?.reasoning as Record<string, unknown> | undefined) || undefined;
        const hasGameGeneratorMeta =
          !!reasoning && reasoning['game_generator'] !== undefined;
        return isAssistant && hasGameGeneratorMeta;
      });
    if (found) {
      setExploreOpen(true);
    }
  }, [initialMessages]);

  // Open Explore during live streaming when a game-signal appears
  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0) return;
    const latestWithGameSignal = [
      ...(messages as Array<Record<string, unknown>>),
    ]
      .reverse()
      .find((m) => {
        const role = (m?.role as string) || '';
        const isAssistant = role === 'assistant' || role === 'ASSISTANT';
        const reasoning =
          (m?.reasoning as Record<string, unknown> | undefined) || undefined;
        const parts =
          (m?.parts as Array<{ type?: string; text?: string }> | undefined) ||
          undefined;
        const hasSignalReasoning =
          !!reasoning && reasoning['game-signal'] !== undefined;
        const hasSignalPart = Array.isArray(parts)
          ? parts.some((p) => p?.type === 'game-signal')
          : false;
        return isAssistant && (hasSignalReasoning || hasSignalPart);
      });
    if (latestWithGameSignal) {
      setExploreOpen(true);
    }
  }, [messages]);

  // Navigation items with dynamic active state
  const navigationItems = getNavigationItems();

  // Mobile sidebar content (with navigation and user info)
  const MobileSidebarContent = () => (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">AI Playground</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 py-3">
        <div className="mb-6">
          <Button
            onClick={() => {
              router.push('/dashboard/playground');
              if (isMobile) setSidebarOpen(false);
            }}
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
                onClick={() => {
                  router.push(item.href);
                  if (isMobile) setSidebarOpen(false);
                }}
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
        <SelectAssistant activeChatId={chatId} />
      </div>

      {/* User Info */}
      <div className="border-t border-gray-100">
        <SidebarProvider>
          <NavUser
            user={{
              email: 'aiheheopen@gmail.com',
              avatar: '/avatar-placeholder.png',
            }}
          />
        </SidebarProvider>
      </div>
    </div>
  );

  return (
    <div {...getRootProps()} className="w-full p-3 flex flex-col gap-3">
      {/* Header */}
      <div className="w-full px-3 py-2 bg-white rounded-xl">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs font-medium text-[#272727] leading-4">
            {chatInfo?.title || 'No Chat Selected'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 !px-1"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingIcon />
              Setting
            </Button>
            <Button variant="ghost" size="sm" className="p-0 !px-1">
              <ShareIcon />
              Share
            </Button>
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="w-full h-full">
        <ResizablePanel
          defaultSize={isExploreExpanded ? 0 : exploreOpen ? 40 : 100}
          minSize={isExploreExpanded ? 0 : 30}
          className="flex flex-col transition-all duration-300 ease-in-out"
        >
          {/* Mobile Header with Menu Button */}
          {isMobile && (
            <div className="flex items-center p-4 border-b border-gray-200 bg-white">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="mr-3">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <MobileSidebarContent />
                </SheetContent>
              </Sheet>
              <h1 className="text-lg font-semibold text-gray-900">
                AI Playground
              </h1>
            </div>
          )}

          {/* Messages */}
          <Conversation className="overflow-hidden">
            <ConversationContent className="px-4 py-2">
              {/* Loading indicator for fetching more messages */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="text-sm text-muted-foreground">
                    Loading more messages...
                  </div>
                </div>
              )}
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16  rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    What should we build today?
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Ask me anything! I&#39;m here to help with your questions
                    and tasks.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLast={index === messages.length - 1}
                    isLoading={
                      (isAssistantStreaming || isLoading) &&
                      index === messages.length - 1 &&
                      message.role === ChatRole.ASSISTANT
                    }
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Input Area */}
          <div className="bg-sidebar">
            <ChatInput
              disabled={!canType}
              value={input}
              onChange={handleInputChange}
              onSubmit={handleSubmitWithAttachments}
              submitDisabled={!canSubmit}
              status={status}
              bannerPosition="top"
              chatId={chatId}
              onFilesUploaded={handleFilesUploaded}
            />
          </div>
        </ResizablePanel>

        {/* Right Explore Panel */}
        {exploreOpen && (
          <>
            <ResizableHandle className="bg-white" />
            <ResizablePanel
              defaultSize={isExploreExpanded ? 100 : 60}
              minSize={isExploreExpanded ? 100 : 30}
              maxSize={isExploreExpanded ? 100 : 70}
              className="rounded-xl"
            >
              <ExplorePanel
                chatId={chatId}
                messages={messages as unknown[]}
                onRequestOpen={() => {
                  setExploreOpen(true);
                }}
                onGameSignalReceived={() => {
                  if (exploreRefetchRef.current) {
                    exploreRefetchRef.current();
                  }
                }}
                onChatExpand={setIsExploreExpanded}
                isChatExpanded={isExploreExpanded}
              />
            </ResizablePanel>
          </>
        )}

        {/* Chat Settings Panel */}
        <ChatSettings
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </ResizablePanelGroup>

      {/* Drag Drop Overlay */}
      <DragDropOverlay />
    </div>
  );
}

// Main component with DragDropProvider
export function PlaygroundChatClient({ chatId }: PlaygroundChatClientProps) {
  return (
    <DragDropProvider>
      <PlaygroundChatClientInner chatId={chatId} />
    </DragDropProvider>
  );
}
