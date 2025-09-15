'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useInfiniteChatList } from '@/queries/useChat';
import { Clock } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useMemo, useState } from 'react';
import ChevronDown from '../../../../../public/icon/chevron-down';

type SelectAssistantProps = {
  activeChatId?: string;
};

type ChatListItem = {
  id: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  version?: string;
  version_name?: string;
};

export const SelectAssistant: FC<SelectAssistantProps> = ({ activeChatId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    data: chatData,
    isLoading: chatLoading,
    error: chatError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteChatList();

  const chats: ChatListItem[] = (chatData?.pages ?? [])
    .flatMap((page) => (Array.isArray(page?.data?.data) ? page.data.data : []))
    .filter(Boolean);

  const [isOpen, setIsOpen] = useState<boolean>(true);

  const displayedChats = useMemo(() => chats.slice(0, 5), [chats]);

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const then = new Date(dateStr).getTime();
    if (isNaN(then)) return '';
    const diffMs = Date.now() - then;
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} minute${min > 1 ? 's' : ''} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`;
    const day = Math.floor(hr / 24);
    return `${day} day${day > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-3 text-paragraph">
      {/* History */}
      {chats.length === 0 && !chatLoading && !chatError ? (
        <div className="rounded-xl border border-dashed text-[#272727]/50">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            History
          </div>
          <div className="px-3 pb-3 text-xs">
            You haven&apos;t created any chats yet.
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-background p-2 pb-4">
          <button
            type="button"
            className="w-full flex items-center justify-between px-2 py-1.5 text-xs"
            onClick={() => setIsOpen((v) => !v)}
          >
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-[#272727]/50">History</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                isOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {isOpen && (
            <div className="text-xs">
              {chatLoading &&
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="px-2 py-1.5">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}

              {chatError && (
                <div className="text-xs text-red-500 px-3 pb-2">
                  {chatError instanceof Error
                    ? chatError.message
                    : 'Error fetching chats'}
                </div>
              )}

              {!chatLoading &&
                !chatError &&
                displayedChats.map((chat: ChatListItem, index: number) => {
                  const currentChatId =
                    activeChatId || pathname.split('/').pop();
                  const isActive = currentChatId === chat.id;
                  const version: string | undefined =
                    chat?.version || chat?.version_name;
                  const subtitleLeft = formatRelativeTime(
                    chat?.created_at || chat?.updated_at,
                  );

                  return (
                    <button
                      key={chat.id || index}
                      className={`cursor-pointer w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors truncate ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                      onClick={() => {
                        if (chat.id)
                          router.push(`/dashboard/playground/${chat.id}`);
                      }}
                    >
                      <div className="truncate line-clamp-1">
                        {chat.title || 'Untitled Chat'}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{subtitleLeft || ''}</span>
                        {version && (
                          <span className="font-medium">
                            {String(version).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

              {(hasNextPage ||
                (!chatLoading && chats.length > displayedChats.length)) && (
                <div className="">
                  <button
                    className="text-xs underline underline-offset-3 cursor-pointer"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    aria-busy={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Loading…' : 'See more'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
