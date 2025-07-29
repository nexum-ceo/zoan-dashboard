import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AgentType } from '@/types/agent';
import { GetChatListResType } from '@/types/chat';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

type SelectAssistantProps = {
  onAgentChange?: (agentId: string) => void;
};

const SelectAssistant: FC<SelectAssistantProps> = ({ onAgentChange }) => {
  const router = useRouter();
  // Agent state
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(
    undefined,
  );
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  // Chat state
  const [chats, setChats] = useState<GetChatListResType['chats']>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Fetch agents
  useEffect(() => {
    setAgentLoading(true);
    fetch('/api/agent')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch agent list');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.data)) {
          setAgents(data.data);
        } else if (Array.isArray(data)) {
          setAgents(data);
        } else {
          setAgents([]);
        }
        setAgentError(null);
      })
      .catch((err) => {
        setAgentError(err.message || 'Error fetching agents');
      })
      .finally(() => setAgentLoading(false));
  }, []);

  // Fetch chats
  useEffect(() => {
    setChatLoading(true);
    fetch('/api/chat')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch chat list');
        return res.json() as Promise<GetChatListResType>;
      })
      .then((data) => {
        if (Array.isArray(data?.chats)) {
          setChats(
            data.chats.sort(
              (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
            ),
          );
        } else {
          setChats([]);
        }
        setChatError(null);
      })
      .catch((err) => {
        setChatError(err.message || 'Error fetching chats');
      })
      .finally(() => setChatLoading(false));
  }, []);

  const handleAgentChange = (value: string) => {
    setSelectedAgent(value);
    if (onAgentChange) onAgentChange(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Choose Agent</h3>
        <Select value={selectedAgent} onValueChange={handleAgentChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose agent..." />
          </SelectTrigger>
          <SelectContent>
            {agentLoading && (
              <div className="px-3 py-2 text-xs text-gray-400">Loading...</div>
            )}
            {agentError && (
              <div className="px-3 py-2 text-xs text-red-500">{agentError}</div>
            )}
            {!agentLoading && !agentError && agents.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-400">
                Do not have any agents
              </div>
            )}
            {!agentLoading &&
              !agentError &&
              agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div>
                    <div className="font-medium text-sm">
                      {agent.name || agent.name || 'Agent'}
                    </div>
                    {agent.description && (
                      <div className="text-xs text-gray-500">
                        {agent.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Recent Chats</h4>
        <div className="space-y-1 h-full overflow-y-auto">
          {chatLoading && (
            <div className="text-xs text-gray-400 px-3">Loading...</div>
          )}
          {chatError && (
            <div className="text-xs text-red-500 px-3">{chatError}</div>
          )}
          {!chatLoading && !chatError && chats.length === 0 && (
            <div className="text-xs text-gray-400 px-3">No recent chats</div>
          )}
          {!chatLoading &&
            !chatError &&
            chats.map((chat, index) => (
              <button
                key={chat.id || index}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-150 truncate"
                onClick={() => {
                  if (chat.id) {
                    router.push(`/dashboard/playground/${chat.id}`);
                  }
                }}
              >
                {chat.title || 'Untitled Chat'}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SelectAssistant;
