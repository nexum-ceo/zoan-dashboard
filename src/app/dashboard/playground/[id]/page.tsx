'use client';
import { SelectAssistant } from '@/app/dashboard/playground/components';
import { ChatSettings } from '@/app/dashboard/playground/components/chat-setting';
import { ChatInput } from '@/app/dashboard/playground/components/ChatInput';
import { ChatMessage } from '@/app/dashboard/playground/components/ChatMessage';
import { Explore } from '@/app/dashboard/playground/components/explore';

import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAgent } from '@/contexts/AgentContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChat } from '@/hooks/useChat';
import { useGetAgentList } from '@/queries/useAgent';
import { useGetChat, useGetChatMessages } from '@/queries/useChat';
import { ChatMessageType, ChatRole } from '@/types/chat';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  Bot,
  Gamepad2,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function PlaygroundChatPage() {
  // Use agent from context
  const { selectedAgentId, setSelectedAgentId } = useAgent();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const chatId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : '';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(true);
  const [exploreOpen, setExploreOpen] = useState<boolean>(false);
  // Get agent list to display selected agent info
  const { data: agentData } = useGetAgentList();
  const agents = agentData?.data.data || [];
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

  // Get the first message from localStorage if it exists
  const [pendingMsg, setPendingMsg] = useState<string>(() => {
    return localStorage.getItem('pendingMessage') || '';
  });
  const [firstMsgSent, setFirstMsgSent] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    wsConnected,
    sendMessageDirect,
  } = useChat({
    wsUrl: token
      ? `${process.env.NEXT_PUBLIC_WS_URL}/${chatId}?token=${token}`
      : '',
    initialMessages: [],
    agentId: selectedAgentId || '',
    chatId: chatId,
  });
  const { data: chatMessageData } = useGetChatMessages(chatId);
  const { data: chatData } = useGetChat(chatId);

  const chatMessages = chatMessageData?.data?.data;
  const chatInfo = chatData?.data?.data;

  useEffect(() => {
    if (chatMessages && Array.isArray(chatMessages)) {
      const safeMessages = chatMessages.map((msg: ChatMessageType) => ({
        ...msg,
        content: msg.content ?? '',
        role: Object.values(ChatRole).includes(msg.role)
          ? msg.role
          : ChatRole.USER,
      }));
      setMessages(safeMessages || []);
    }
  }, [chatMessages, setMessages]);

  useEffect(() => {
    if (chatInfo?.agent_id) {
      setSelectedAgentId(chatInfo.agent_id);
    }
  }, [chatInfo, setSelectedAgentId]);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        setToken(data.accessToken);
      });
  }, []);

  // Only send the first message when WebSocket is connected, otherwise keep it to send later
  useEffect(() => {
    if (pendingMsg && !firstMsgSent && wsConnected) {
      sendMessageDirect(pendingMsg);
      setFirstMsgSent(true);
      setPendingMsg('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingMessage');
      }
    }
  }, [pendingMsg, firstMsgSent, wsConnected, sendMessageDirect]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    }
  }, [messages.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length, handleScroll]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Navigation items with dynamic active state
  const navigationItems = [
    {
      icon: Bot,
      label: 'Playground',
      href: '/dashboard/playground',
      isActive: (pathname: string) =>
        pathname.startsWith('/dashboard/playground'),
    },
    {
      icon: Users,
      label: 'Assistants',
      href: '/dashboard/assistant',
      isActive: (pathname: string) =>
        pathname.startsWith('/dashboard/assistant'),
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/dashboard/setting',
      isActive: (pathname: string) => pathname.startsWith('/dashboard/setting'),
    },
  ];

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
        <SelectAssistant activeChatId={params.id as string} />
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
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
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
        <div className="w-full px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-900">
                  {selectedAgent?.name || 'No Agent Selected'}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedAgent?.description || 'Please select an agent'}
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
                      setSettingsOpen(false); // Close settings when opening explore
                    }
                  }}
                  className={exploreOpen ? 'bg-gray-100' : ''}
                >
                  <Gamepad2 className="w-4 h-4 text-gray-500" />
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
                      setExploreOpen(false); // Close explore when opening settings
                    }
                  }}
                  className={settingsOpen ? 'bg-gray-100' : ''}
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 px-6 py-4 space-y-6 w-full overflow-y-auto h-full"
        >
          {!selectedAgentId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Please select an agent to start chatting
              </h3>
              <p className="text-gray-500 max-w-md">
                You must select an agent before you can chat.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16  rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 max-w-md">
                Ask me anything! I&#39;m here to help with your questions and
                tasks.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                isLoading={
                  isLoading &&
                  index === messages.length - 1 &&
                  message.role === ChatRole.ASSISTANT
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <Button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-44 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-all"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-6 h-6" />
          </Button>
        )}

        {/* Input Area */}
        <div className="p-6 bg-white">
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            disabled={!selectedAgentId}
          />
        </div>
      </div>

      {/* Chat Settings Panel */}
      <ChatSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Explore Panel */}
      <Explore isOpen={exploreOpen} onClose={() => setExploreOpen(false)} />
    </div>
  );
}
