'use client';

import { SelectAssistant } from '@/app/dashboard/playground/components';
import { ChatInput } from '@/app/dashboard/playground/components/chat-input';
import { ChatMessage } from '@/app/dashboard/playground/components/chat-message';
import { ChatSettings } from '@/app/dashboard/playground/components/chat-setting';
import { Explore } from '@/app/dashboard/playground/components/explore';

import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { ChatMessage as HookChatMessage } from '@/hooks/useSSEChat';
import { useSSEChat } from '@/hooks/useSSEChat';
import {
  clearPendingMessage,
  getPendingMessage,
  transformChatMessages,
} from '@/lib/chat-utils';
import { getNavigationItems } from '@/lib/navigation-utils';
import { useGetChat, useGetChatMessagesInfinite } from '@/queries/useChat';
import { ChatRole } from '@/types/chat';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type PlaygroundChatClientProps = {
  chatId: string;
};

export function PlaygroundChatClient({ chatId }: PlaygroundChatClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(true);
  const [exploreOpen, setExploreOpen] = useState<boolean>(false);
  const isSidePanelOpen = (settingsOpen || exploreOpen) && !isMobile;

  // Get the first message from localStorage if it exists
  const [pendingMsg, setPendingMsg] = useState<string>(() =>
    getPendingMessage(),
  );
  const [firstMsgSent, setFirstMsgSent] = useState<boolean>(false);
  // const [token, setToken] = useState<string>('');
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
    sseConnected,
    sendMessageDirect,
    isProcessing,
    setMessages,
  } = useSSEChat({
    sseUrl: chatInfo?.user_id ? `/api/chat/${chatId}/stream` : '',
    initialMessages,
    chatId: chatId,
    user_id: chatInfo?.user_id || '',
  });

  // useEffect(() => {
  //   fetchAuthToken().then(setToken);
  // }, []);

  // Only send the first message when SSE is connected, otherwise keep it to send later
  useEffect(() => {
    if (pendingMsg && !firstMsgSent && sseConnected) {
      sendMessageDirect(pendingMsg);
      setFirstMsgSent(true);
      setPendingMsg('');
      clearPendingMessage();
    }
  }, [pendingMsg, firstMsgSent, sseConnected, sendMessageDirect]);

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

  // Auto-open Explore panel when assistant emits a game-signal
  const lastGameSignalMessageIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0) return;

    // Find the latest assistant message that contains a part with type 'game-signal'
    const latestWithSignal = [...messages]
      .reverse()
      .find((m: HookChatMessage) => {
        if (m.role !== ChatRole.ASSISTANT) return false;
        const parts = m.parts as Array<{ type?: string }> | undefined;
        return (
          Array.isArray(parts) && parts.some((p) => p?.type === 'game-signal')
        );
      });

    if (!latestWithSignal) return;

    if (
      latestWithSignal.id &&
      lastGameSignalMessageIdRef.current !== latestWithSignal.id
    ) {
      lastGameSignalMessageIdRef.current = latestWithSignal.id;
      setExploreOpen(true);
      setSettingsOpen(false);
      if (exploreRefetchRef.current) {
        exploreRefetchRef.current();
      }
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
    <div className="w-full h-screen bg-sidebar flex">
      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col bg-sidebar relative transition-[margin] duration-300 ease-out ${
          isSidePanelOpen ? 'md:mr-96' : 'md:mr-0'
        }`}
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

        {/* Header */}
        <div className="w-full px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-500/10">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-foreground">
                  {chatInfo?.title || 'No Agent Selected'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {'Please select an agent'}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (exploreOpen) {
                      setExploreOpen(false);
                    } else {
                      setExploreOpen(true);
                      setSettingsOpen(false);
                    }
                  }}
                  className={
                    exploreOpen
                      ? 'bg-accent text-accent-foreground shadow-lg ring-2 ring-ring/30'
                      : 'hover:bg-muted'
                  }
                >
                  <Gamepad2 className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (settingsOpen) {
                      setSettingsOpen(false);
                    } else {
                      setSettingsOpen(true);
                      setExploreOpen(false);
                    }
                  }}
                  className={
                    settingsOpen
                      ? 'bg-accent text-accent-foreground shadow-lg ring-2 ring-ring/30'
                      : 'hover:bg-muted'
                  }
                >
                  <Settings className="w-4 h-4 " />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 w-full overflow-hidden h-full">
          <div
            ref={messagesContainerRef}
            className="relative size-full overflow-y-auto"
          >
            <Conversation className="relative size-full">
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
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-sidebar">
          <ChatInput
            disabled={isProcessing}
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            submitDisabled={isProcessing}
          />
        </div>
      </div>

      {/* Chat Settings Panel */}
      {chatInfo && (
        <ChatSettings
          isOpen={settingsOpen}
          chatInfo={chatInfo}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Explore Panel */}
      {exploreOpen && (
        <Explore
          chatId={chatId}
          isOpen={exploreOpen}
          onClose={() => setExploreOpen(false)}
          onGameSignalReceived={() => {
            if (exploreRefetchRef.current) {
              exploreRefetchRef.current();
            }
          }}
        />
      )}
    </div>
  );
}
