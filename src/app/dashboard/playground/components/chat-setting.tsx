'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { handleErrorApi, HttpError } from '@/lib/utils';
import { useGetAgentAvailable } from '@/queries/useAgent';
import {
  useCreateChatAgentSettingMutation,
  useGetChatAgentSettingByChatId,
  useGetPrimaryAgentByChatId,
} from '@/queries/useChat';
import { AgentType } from '@/types/agent';
import {
  GetChatAgentSettingByChatIdResType,
  GetSpecificChatResType,
} from '@/types/chat';
import { IconRobot } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { FC, useMemo, useState } from 'react';

type ChatSettingsProps = {
  isOpen: boolean;
  chatInfo: GetSpecificChatResType['data'];
  onClose: () => void;
};

export const ChatSettings: FC<ChatSettingsProps> = ({
  isOpen,
  onClose,
  chatInfo,
}) => {
  const { id: chatId } = useParams();
  const { data: primaryAgentData } = useGetPrimaryAgentByChatId(
    chatId as string,
  );
  const primaryAgent = primaryAgentData?.data.data;

  // Chat Parameters State
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [creativity, setCreativity] = useState<number[]>([0.4]);
  const [responseLength, setResponseLength] = useState<number[]>([2048]);
  const [memory, setMemory] = useState<number[]>([4000]);

  const { data: chatAgentSettingData } = useGetChatAgentSettingByChatId(
    chatId as string,
  );
  const { data: agentData } = useGetAgentAvailable();

  const createChatAgentSettingMutation = useCreateChatAgentSettingMutation(
    chatId as string,
  );
  const chatAgentSetting = useMemo<GetChatAgentSettingByChatIdResType['data']>(
    () => chatAgentSettingData?.data.data || [],
    [chatAgentSettingData],
  );
  const agentsAvailable = useMemo<AgentType[]>(
    () => agentData?.data.data || [],
    [agentData],
  );

  // Merge primary agent into available agents (if not already present)
  const agents: AgentType[] = useMemo(() => {
    if (!primaryAgent) return agentsAvailable;
    const exists = (agentsAvailable || []).some(
      (a) => a.id === primaryAgent.id,
    );
    return exists
      ? agentsAvailable
      : [primaryAgent as unknown as AgentType, ...agentsAvailable];
  }, [agentsAvailable, primaryAgent]);

  // Enhance agents with derived flags: active (exists in chatAgentSetting) and isPrimary
  type AgentWithState = AgentType & { active: boolean; isPrimary: boolean };
  const agentsWithState = useMemo<AgentWithState[]>(() => {
    if (!agents) return [];
    const settingMap = new Map(
      (chatAgentSetting || []).map((setting) => [setting.agent_id, setting]),
    );
    return agents.map((agent) => {
      const setting = settingMap.get(agent.id);
      return {
        ...agent,
        active: Boolean(setting),
        isPrimary: Boolean(setting?.is_primary),
      };
    });
  }, [agents, chatAgentSetting]);

  // Sort agents: primary agents first, then secondary agents
  const sortedAgents = useMemo(() => {
    if (!agentsWithState) return agentsWithState;

    return [...agentsWithState].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return 0;
    });
  }, [agentsWithState]);

  const handleAgentToggle = async (agentId: string) => {
    try {
      if (!chatAgentSetting) return;
      // Check if agent is currently active
      const isCurrentlyActive = chatAgentSetting.some(
        (setting) => setting.agent_id === agentId,
      );

      let newAgentIdList: string[];

      if (isCurrentlyActive) {
        // Agent is currently active, remove it
        newAgentIdList = chatAgentSetting
          .filter((setting) => setting.agent_id !== agentId)
          .map((setting) => setting.agent_id);
      } else {
        // Agent is not active, add it
        const currentAgentIds = chatAgentSetting.map(
          (setting) => setting.agent_id,
        );
        newAgentIdList = [...currentAgentIds, agentId];
      }

      await createChatAgentSettingMutation.mutateAsync({
        agent_id_list: newAgentIdList,
      });
    } catch (error) {
      if (!chatId) {
        handleErrorApi({
          error: new HttpError({
            data: null,
            message: 'Please select a chat',
            status: 'INVALID',
          }),
        });
      } else {
        handleErrorApi({ error });
      }
    }
  };

  const modelOptions = [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4o',
    'gpt-4o-mini',
  ];

  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <>
          {/* Drawer */}
          <motion.div
            key={String(chatId)}
            initial={{ x: '100%', opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 1 }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.28 }}
            className="fixed inset-y-0 right-0 w-96 border-l border-border bg-background backdrop-blur-sm shadow-2xl flex flex-col"
            style={{
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
              willChange: 'transform',
            }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Chat Settings
                  </h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="preferences" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="preferences"
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger
                    value="agents"
                    className="flex items-center gap-2"
                  >
                    <IconRobot className="w-4 h-4" />
                    Agents
                  </TabsTrigger>
                </TabsList>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6">
                  {/* Chat Title Section */}
                  <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-400/20 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground text-base">
                          Chat Title
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Input
                        id="chat-title"
                        type="text"
                        placeholder="Enter chat title..."
                        defaultValue={chatInfo.title}
                        disabled
                        className="w-full bg-muted/50 border-muted-foreground/20 text-muted-foreground cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        Give your conversation a memorable name
                      </p>
                    </div>
                  </div>

                  {/* Primary Prompt Section */}
                  <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 p-1.5 rounded-lg bg-purple-50 dark:bg-purple-400/10 text-purple-600 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-400/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground text-base">
                          Prompt
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {primaryAgent ? (
                        <Textarea
                          id="chat-prompt"
                          placeholder="Enter system prompt..."
                          className="min-h-[80px] resize-none"
                          defaultValue={primaryAgent.prompt}
                        />
                      ) : (
                        <div className="min-h-[80px] rounded-md border border-dashed border-muted-foreground/20 flex items-center justify-center bg-muted/30">
                          <div className="text-center text-muted-foreground">
                            <Sparkles className="w-6 h-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">
                              Select an agent to configure prompts
                            </p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        This prompt defines how the AI assistant should behave
                        and respond
                      </p>
                    </div>
                  </div>

                  {/* Primary Agent Section */}
                  <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
                    {primaryAgent ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shadow-sm">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground leading-tight line-clamp-1">
                                {primaryAgent.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Primary Agent
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="gap-1.5 rounded-full bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-600/15 transition-colors dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20"
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                            Active
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {primaryAgent.description}
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <div className="h-12 w-12 mx-auto mb-3 p-3 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                          <Bot className="w-6 h-6" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">
                          No Agent Selected
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Start a conversation to see your primary agent here
                        </p>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Users className="w-4 h-4" />
                          Select Agent
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      {/* Model Selection - Always show */}
                      <Label htmlFor="model" className="text-sm font-medium">
                        AI Model
                      </Label>
                      <Select
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {modelOptions.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Choose the AI model for this conversation
                      </p>
                    </div>
                  </div>

                  {/* Chat Parameters Section */}
                  <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 p-1.5 rounded-lg bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-400/20 flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground text-base">
                          Chat Parameters
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Configure AI response behavior and settings
                        </p>
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="creativity"
                          className="text-sm font-medium"
                        >
                          Temperature
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {creativity[0]}
                        </span>
                      </div>
                      <Slider
                        id="creativity"
                        min={0}
                        max={1}
                        step={0.1}
                        value={creativity}
                        onValueChange={setCreativity}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls creativity and randomness
                      </p>
                    </div>

                    {/* Max Tokens Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="responseLength"
                          className="text-sm font-medium"
                        >
                          Max Tokens
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {responseLength[0]}
                        </span>
                      </div>
                      <Slider
                        id="responseLength"
                        min={100}
                        max={4096}
                        step={100}
                        value={responseLength}
                        onValueChange={setResponseLength}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum length of AI responses
                      </p>
                    </div>

                    {/* Top-p Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="memory" className="text-sm font-medium">
                          Top-p
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {memory[0] / 4000}
                        </span>
                      </div>
                      <Slider
                        id="memory"
                        min={1000}
                        max={8000}
                        step={500}
                        value={memory}
                        onValueChange={setMemory}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls diversity of word choices
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Agents Tab */}
                <TabsContent value="agents" className="space-y-6">
                  {/* Available Agents Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 p-1.5 rounded-lg bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-400/20 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground text-base">
                          Available Agents
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Enable agents that can respond to specific intents in
                          your conversation
                        </p>
                      </div>
                    </div>

                    {sortedAgents && sortedAgents.length > 0 ? (
                      sortedAgents.map((agent) => (
                        /* Agent Item */
                        <div
                          key={agent.id}
                          className="border border-border rounded-lg p-4 space-y-3 bg-card/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 p-1.5 rounded-lg bg-purple-50 dark:bg-purple-400/10 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="font-medium text-foreground line-clamp-1">
                                  {agent.name}
                                </div>
                                <div className="flex gap-1">
                                  {agent.isPrimary ? (
                                    <Badge className="text-xs px-2 py-0.5 bg-blue-600 text-white">
                                      Primary
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-0.5"
                                    >
                                      Secondary
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={agent.active}
                              onCheckedChange={() =>
                                handleAgentToggle(agent.id)
                              }
                              disabled={
                                createChatAgentSettingMutation.isPending
                              }
                            />
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {agent.description}
                          </p>

                          <div className="space-y-2">
                            <div>
                              <p className="font-medium text-xs text-foreground mb-1.5">
                                Trigger Keywords:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                                >
                                  general
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                                >
                                  help
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                                >
                                  explain
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                                >
                                  what
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                                >
                                  +2 more
                                </Badge>
                              </div>
                            </div>

                            <div>
                              <div className="flex flex-wrap gap-1">
                                <Badge className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-400/20">
                                  General Knowledge
                                </Badge>
                                <Badge className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-400/20">
                                  Task Coordination
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0.5"
                                >
                                  +1 more
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="h-12 w-12 mx-auto mb-3 p-3 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                        <h4 className="font-medium text-foreground mb-2">
                          No Agents Available
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Agents will appear here once you start a conversation
                        </p>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Bot className="w-4 h-4" />
                          Browse Agents
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-border mt-6">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1">Save Settings</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
