'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { useGetAgentList } from '@/queries/useAgent';
import {
  useGetChatAgentSettingByChatId,
  useGetPrimaryAgentByChatId,
} from '@/queries/useChat';
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
  onClose: () => void;
};

export const ChatSettings: FC<ChatSettingsProps> = ({ isOpen, onClose }) => {
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

  // Preferences State
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [showTyping, setShowTyping] = useState<boolean>(true);
  const [intentDetection, setIntentDetection] = useState<boolean>(false);
  const [agentSwitching, setAgentSwitching] = useState<boolean>(true);
  const { data: chatAgentSettingData } = useGetChatAgentSettingByChatId(
    chatId as string,
  );
  const { data: agentData } = useGetAgentList();
  const chatAgentSetting = chatAgentSettingData?.data.data;
  const agents = agentData?.data.data;
  // Sort agents: primary agents first, then secondary agents
  const sortedAgents = useMemo(() => {
    if (!agents || !chatAgentSetting) return agents;

    return [...agents].sort((a, b) => {
      const aIsPrimary =
        chatAgentSetting.find((setting) => setting.agent_id === a.id)
          ?.is_primary || false;
      const bIsPrimary =
        chatAgentSetting.find((setting) => setting.agent_id === b.id)
          ?.is_primary || false;

      if (aIsPrimary && !bIsPrimary) return -1;
      if (!aIsPrimary && bIsPrimary) return 1;

      return 0;
    });
  }, [agents, chatAgentSetting]);

  const modelOptions = [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4o',
    'gpt-4o-mini',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            x: '100%',
            opacity: 0,
            scale: 0.98,
          }}
          animate={{
            x: 0,
            opacity: 1,
            scale: 1,
          }}
          exit={{
            x: '100%',
            opacity: 0,
            scale: 0.98,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 35,
            mass: 0.9,
            duration: 0.5,
          }}
          className="w-96 border-l border-border bg-background backdrop-blur-sm shadow-2xl flex flex-col h-full"
          style={{
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Primary Agent Section */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
              {primaryAgent ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 p-2 rounded-lg bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-400/20 flex items-center justify-center shadow-sm">
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
                  <div className="h-12 w-12 mx-auto mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
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

              {/* Model Selection - Always show */}
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium">
                  AI Model
                </Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
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

            {/* Primary Prompt Section */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-6 text-card-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-medium dark:text-gray-100">
                  Primary Prompt
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Set the context and behavior for your chat session.
              </p>
              {primaryAgent ? (
                <Textarea
                  placeholder={primaryAgent.prompt}
                  className="min-h-[100px] resize-none"
                  defaultValue={primaryAgent.prompt}
                />
              ) : (
                <div className="min-h-[100px] rounded-md border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Select an agent to configure prompts
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Intent Detection Section */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-6 text-card-foreground">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <h3 className="font-medium dark:text-gray-100">
                  Intent Detection
                </h3>
              </div>
              {primaryAgent ? (
                <>
                  <div className="rounded-lg p-4 border border-green-200 bg-green-50 dark:border-emerald-800 dark:bg-emerald-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800 dark:text-emerald-300">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-emerald-300/80">
                      AI will automatically detect your intent and route to the
                      appropriate agent.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Active Agents:</strong> 4 of 5
                  </p>
                </>
              ) : (
                <div className="rounded-lg p-4 border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Inactive
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Intent detection will be available once you select an agent.
                  </p>
                </div>
              )}
            </div>

            {/* Available Agents Section */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-6 text-card-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <h3 className="font-medium dark:text-gray-100">
                  Available Agents
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Enable agents that can respond to specific intents in your
                conversation.
              </p>

              {sortedAgents && sortedAgents.length > 0 ? (
                sortedAgents.map((agent) => (
                  /* Agent Item */
                  <div
                    key={agent.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-medium dark:text-gray-100 line-clamp-1">
                            {agent.name}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {chatAgentSetting?.find(
                              (setting) => setting.agent_id === agent.id,
                            )?.is_primary
                              ? 'Primary'
                              : 'Secondary'}
                          </Badge>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="mb-2">
                        {' '}
                        <b>Model:</b> {agent.model}
                      </div>
                      <p>{agent.description}</p>
                      <div className="mt-2">
                        <p className="font-medium mb-1">Trigger Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            general
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            help
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            explain
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            what
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            +2 more
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge className="text-xs">General Knowledge</Badge>
                        <Badge className="text-xs">Task Coordination</Badge>
                        <Badge variant="outline" className="text-xs">
                          +1 more
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 mx-auto mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">
                    No Agents Available
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Agents will appear here once you start a conversation
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      // TODO: Navigate to agent selection
                      console.log('Browse agents clicked');
                    }}
                  >
                    <Bot className="w-4 h-4" />
                    Browse Agents
                  </Button>
                </div>
              )}
            </div>

            {/* Chat Parameters Section */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <h3 className="font-medium dark:text-gray-100">
                  Chat Parameters
                </h3>
              </div>

              {/* Creativity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="creativity" className="text-sm font-medium">
                    Creativity
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
                  Higher values make responses more creative
                </p>
              </div>

              {/* Response Length Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="responseLength"
                    className="text-sm font-medium"
                  >
                    Response Length
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

              {/* Memory Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="memory" className="text-sm font-medium">
                    Memory
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {memory[0]}
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
                  How much conversation history to remember
                </p>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
              <h3 className="font-medium text-foreground">Preferences</h3>

              {/* Auto-save conversations */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Auto-save conversations
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically save chat history
                  </p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>

              {/* Show typing indicator */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Show typing indicator
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display when AI is thinking
                  </p>
                </div>
                <Switch checked={showTyping} onCheckedChange={setShowTyping} />
              </div>

              {/* Intent detection */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Intent detection
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically route to specialized agents
                  </p>
                </div>
                <Switch
                  checked={intentDetection}
                  onCheckedChange={setIntentDetection}
                />
              </div>

              {/* Agent switching */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Agent switching</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow mid-conversation agent changes
                  </p>
                </div>
                <Switch
                  checked={agentSwitching}
                  onCheckedChange={setAgentSwitching}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Save Settings</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
