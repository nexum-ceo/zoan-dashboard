import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GetChatListResType } from '@/types/chat';
import { Bot, Brain, Code, Palette, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const assistants = [
  {
    id: 'general',
    name: 'General Assistant',
    description: 'Helpful for general questions and tasks',
    icon: Bot,
    color: 'from-blue-500 to-purple-600',
  },
  {
    id: 'creative',
    name: 'Creative Writer',
    description: 'Specialized in creative writing and content',
    icon: Palette,
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'technical',
    name: 'Technical Expert',
    description: 'Expert in programming and technical topics',
    icon: Code,
    color: 'from-green-500 to-teal-600',
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    description: 'Specialized in data analysis and insights',
    icon: Brain,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'fast',
    name: 'Quick Response',
    description: 'Optimized for fast, concise responses',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
  },
];

export default function SelectAssistant() {
  const [chats, setChats] = useState<GetChatListResType['chats']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/chat')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch chat list');
        return res.json();
      })
      .then((data) => {
        setChats(data.chats || data || []);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Error fetching chats');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Choose Assistant
        </h3>
        <Select defaultValue="general">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assistants.map((assistant) => (
              <SelectItem key={assistant.id} value={assistant.id}>
                <div className="flex items-center gap-3 py-1">
                  <div
                    className={`w-6 h-6 bg-gradient-to-r ${assistant.color} rounded-md flex items-center justify-center`}
                  >
                    <assistant.icon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{assistant.name}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Recent Chats</h4>
        <div className="space-y-1">
          {loading && (
            <div className="text-xs text-gray-400 px-3">Loading...</div>
          )}
          {error && <div className="text-xs text-red-500 px-3">{error}</div>}
          {!loading && !error && chats.length === 0 && (
            <div className="text-xs text-gray-400 px-3">No recent chats</div>
          )}
          {!loading &&
            !error &&
            chats.map((chat, index) => (
              <button
                key={chat.id || index}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-150 truncate"
              >
                {chat.title || 'Untitled Chat'}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
