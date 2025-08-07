import { Skeleton } from '@/components/ui/skeleton';
import { useChatList } from '@/queries/useChat';
import { usePathname, useRouter } from 'next/navigation';
import { FC } from 'react';

type SelectAssistantProps = {
  activeChatId?: string;
};

const SelectAssistant: FC<SelectAssistantProps> = ({ activeChatId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    data: chatData,
    isLoading: chatLoading,
    error: chatError,
  } = useChatList();

  // Process chat data
  const chats = chatData?.data?.chats
    ? [...chatData.data.chats].sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Recent Chats</h4>
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
          {!chatLoading && !chatError && chats.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">
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
                      ? 'bg-gray-200  border-l-4 border-gray-500 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: '#f3f4f6',
                          borderLeftColor: '#d1d5db',
                        }
                      : {}
                  }
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

export default SelectAssistant;
