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
import { useAgent } from '@/contexts/AgentContext';
import { useGetAgentList } from '@/queries/useAgent';
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
import { FC, useState } from 'react';

type ChatSettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ChatSettings: FC<ChatSettingsProps> = ({ isOpen, onClose }) => {
  const { data: agentData, isLoading: agentLoading } = useGetAgentList();
  const agents = agentData?.data.data || [];

  const { selectedAgentId, setSelectedAgentId } = useAgent();

  // Chat Parameters State
  const [creativity, setCreativity] = useState<number[]>([0.4]);
  const [responseLength, setResponseLength] = useState<number[]>([2048]);
  const [memory, setMemory] = useState<number[]>([4000]);

  // Preferences State
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [showTyping, setShowTyping] = useState<boolean>(true);
  const [intentDetection, setIntentDetection] = useState<boolean>(false);
  const [agentSwitching, setAgentSwitching] = useState<boolean>(true);

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
            <div className="space-y-3 rounded-xl border border-border bg-card p-6 text-card-foreground">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <h3 className="font-medium text-foreground">
                  {agents.find((agent) => agent.id === selectedAgentId)?.name}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {
                  agents.find((agent) => agent.id === selectedAgentId)
                    ?.description
                }
              </p>
              <Select
                value={selectedAgentId}
                onValueChange={(value) => setSelectedAgentId(value)}
                disabled={agentLoading}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Textarea
                placeholder="You are a helpful assistant that specializes in..."
                className="min-h-[100px] resize-none"
                defaultValue="You are a helpful assistant that specializes in..."
              />
            </div>

            {/* Intent Detection Section */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-6 text-card-foreground">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <h3 className="font-medium dark:text-gray-100">
                  Intent Detection
                </h3>
              </div>
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

              {/* Agent Item */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-medium dark:text-gray-100">
                        General Assistant
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="mb-2">General</div>
                  <p>
                    Primary AI assistant that handles general queries and
                    coordinates with other agents
                  </p>
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
