import { Skeleton } from '@/components/ui/skeleton';
import { useInfiniteChatList } from '@/queries/useChat';
import { usePathname, useRouter } from 'next/navigation';
import { FC } from 'react';

type SelectAssistantProps = {
  activeChatId?: string;
};

export const SelectAssistant: FC<SelectAssistantProps> = ({ activeChatId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    data: chatData,
    isLoading: chatLoading,
    error: chatError,
  } = useInfiniteChatList(10);

  // Process chat data
  const chats = chatData?.pages.flatMap((page) => page.data)
    ? [...chatData.pages.flatMap((page) => page.data)].sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Recent Chats</h4>
        <div className="space-y-1 h-full overflow-y-auto">
          {chatLoading &&
            // Skeleton loading for recent chats
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="px-3 py-2">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          {chatError && (
            <div className="text-xs text-red-500 px-3">
              {chatError instanceof Error
                ? chatError.message
                : 'Error fetching chats'}
            </div>
          )}
          {chats.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Do not have any chats
            </div>
          )}
          {!chatLoading &&
            !chatError &&
            chats.map((chat, index) => {
              // Auto-detect active chat from URL if activeChatId prop is not provided
              const currentChatId = activeChatId || pathname.split('/').pop();
              const isActive = currentChatId === chat.id;
              return (
                <button
                  key={chat.id || index}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 truncate relative ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => {
                    if (chat.id) {
                      router.push(`/dashboard/playground/${chat.id}`);
                    }
                  }}
                >
                  {chat.title || 'Untitled Chat'}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};
