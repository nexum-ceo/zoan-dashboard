'use client';

import {
  Badge,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui';
import { useGetAgentAvailable } from '@/hooks/data/agent';
import {
  useCreateChatAgentSettingMutation,
  useGetChatAgentSettingByChatId,
  useGetPrimaryAgentByChatId,
} from '@/hooks/data/chat';
import { handleErrorApi, HttpError } from '@/lib/utils';
import { AgentType, UpdateAgentBodySchema } from '@/types/agent';
import { GetChatAgentSettingByChatIdResType } from '@/types/chat';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Sparkles, Users, X, Zap } from 'lucide-react';
import { useParams } from 'next/navigation';
import { FC, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import AgentAvatar from '../../../../../public/icon/agent-avatar';
import BotMessageSquare from '../../../../../public/icon/bot-message-square';
import Download from '../../../../../public/icon/download';

type ChatSettingsFormData = z.infer<typeof UpdateAgentBodySchema>;

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

  // React Hook Form setup
  const form = useForm<ChatSettingsFormData>({
    resolver: zodResolver(UpdateAgentBodySchema),
    defaultValues: {
      description: '',
      name: '',
      prompt: '',
      model: 'gpt-4o',
      max_tokens: 2048,
      temperature: 0.4,
      top_p: 0.8,
      type: 'openai',
    },
  });

  const {
    control,
    // handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const watchedValues = watch();
  const { data: chatAgentSettingData } = useGetChatAgentSettingByChatId(
    chatId as string,
  );
  const { data: agentData } = useGetAgentAvailable();
  const createChatAgentSettingMutation = useCreateChatAgentSettingMutation(
    chatId as string,
  );
  // const updateAgentMutation = useUpdateAgentMutation(primaryAgent?.id || '');
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

  useEffect(() => {
    if (primaryAgent) {
      // Set form values from primary agent
      if (primaryAgent) {
        setValue('model', primaryAgent.model);
        setValue('prompt', primaryAgent.prompt);
        setValue('temperature', primaryAgent.model_kwargs.temperature);
        setValue('max_tokens', primaryAgent.model_kwargs.max_tokens);
        setValue('top_p', primaryAgent.model_kwargs.top_p);
      }
    }
  }, [primaryAgent, setValue]);

  // const onSubmit = async (data: ChatSettingsFormData) => {
  //   try {
  //     // Ensure primaryAgent has data before performing update
  //     if (!primaryAgent) {
  //       handleErrorApi({
  //         error: new HttpError({
  //           data: null,
  //           message: 'Primary agent is required to save settings',
  //           status: 'INVALID',
  //         }),
  //       });
  //       return;
  //     }

  //     // Update the primary agent with new settings
  //     await updateAgentMutation.mutateAsync({
  //       description: primaryAgent.description,
  //       model: data.model,
  //       max_tokens: data.max_tokens,
  //       temperature: data.temperature,
  //       top_p: data.top_p,
  //       name: primaryAgent.name,
  //       prompt: data.prompt,
  //       type: primaryAgent.response_format.type,
  //     } as UpdateAgentBodyType);
  //   } catch (error) {
  //     handleErrorApi({ error });
  //   }
  // };

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

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-92 overflow-y-auto p-0 gap-0 [&>button.absolute]:hidden"
      >
        <Tabs defaultValue="agent" className="w-full">
          <SheetHeader className="px-4 py-0 pt-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[#272727] text-[16px] font-medium">
                Setting
              </SheetTitle>
              <div className="flex items-center gap-4">
                <Button variant={'secondary'} className="text-sm">
                  View project
                </Button>
                <SheetClose className="p-0 m-0 text-[#272727]">
                  <X className="w-4 h-4" />
                  <span className="sr-only">Close</span>
                </SheetClose>
              </div>
            </div>
            <TabsList className="w-full flex mt-3 bg-transparent p-0 items-end gap-6 h-auto rounded-none mb-0 ">
              <TabsTrigger
                value="agent"
                className="relative h-auto px-0 pb-0.5 bg-transparent text-[#272727]/20 data-[state=active]:text-[#272727] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-transparent font-medium after:content-[''] after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-0 after:bg-foreground data-[state=active]:after:w-full"
              >
                Agent
              </TabsTrigger>
              <TabsTrigger
                value="primary-prompt"
                className="relative h-auto px-0 pb-0.5 bg-transparent text-[#272727]/20 data-[state=active]:text-[#272727] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-transparent font-medium after:content-[''] after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-0 after:bg-foreground data-[state=active]:after:w-full"
              >
                Primary Prompt
              </TabsTrigger>
              <TabsTrigger
                value="plugin"
                className="relative h-auto px-0 pb-0.5 bg-transparent text-[#272727]/20 data-[state=active]:text-[#272727] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-transparent font-medium after:content-[''] after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-0 after:bg-foreground data-[state=active]:after:w-full"
              >
                Plugin
              </TabsTrigger>
            </TabsList>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Agent Tab */}
            <TabsContent value="agent" className="space-y-2">
              {/* Primary Agent Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BotMessageSquare className="w-4 h-4" />
                  <h3 className="font-medium text-paragraph !text-sm">
                    Primary Agent
                  </h3>{' '}
                </div>
                <div className="text-xs text-muted-foreground">
                  {' '}
                  The main agent that handles general queries and coordinates
                  with specialized agents.
                </div>

                <div className="space-y-2">
                  <Select defaultValue="general-assistant">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select primary agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general-assistant">
                        General Assistant
                      </SelectItem>
                      <SelectItem value="game-developer">
                        Game Developer
                      </SelectItem>
                      <SelectItem value="code-assistant">
                        Code Assistant
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Active Agents:{' '}
                    <span className="text-tag-label !text-[#272727]">
                      {chatAgentSetting?.length} of {agents?.length}
                    </span>
                  </p>
                </div>
              </div>

              {/* Available Agents Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <h3 className="text-paragraph !text-sm">Available Agents</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  The main agent that handles general queries and coordinates
                  with specialized agents.
                </p>

                {sortedAgents && sortedAgents.length > 0 ? (
                  sortedAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="border border-[#272727]/20 rounded-lg p-3 space-y-4 bg-card/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between gap-2 w-full">
                          <AgentAvatar className="w-6 h-6" />
                          <div className="flex flex-col gap-0 flex-1">
                            <div className="text-paragraph !text-sm line-clamp-1">
                              {agent.name}
                            </div>
                            <div>
                              <Badge className="rounded-[2px] text-tag-label p-1 bg-primary-brand-green !text-[#20a357]">
                                Game Development
                              </Badge>
                            </div>
                          </div>
                          <Switch
                            checked={agent.active}
                            onCheckedChange={() => handleAgentToggle(agent.id)}
                            disabled={
                              createChatAgentSettingMutation.isPending ||
                              agent.isPrimary
                            }
                            className="data-[state=unchecked]:bg-[#272727]/10 data-[state=checked]:bg-primary-brand-darker-green disabled:bg-primary-brand-green"
                            thumbClassName="data-[state=unchecked]:bg-[#272727]/50 data-[state=checked]:bg-white"
                          />
                        </div>
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
                              className="rounded-[2px] !text-[10px] text-tag-label p-1 bg-[#272727]/5 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                            >
                              General
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-[2px] text-tag-label !text-[10px] p-1 bg-[#272727]/5 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                            >
                              Help
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-[2px] text-tag-label !text-[10px] p-1 bg-[#272727]/5 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                            >
                              Explain
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-[2px] text-tag-label !text-[10px] p-1 bg-[#272727]/5 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                            >
                              What
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-[2px] text-tag-label !text-[10px] p-1 bg-[#272727]/5 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                            >
                              General Knowledge
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-[2px] text-tag-label !text-[10px] p-1 bg-[#272727]/5 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                            >
                              Task Coordination
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-[2px] text-tag-label !text-[10px] p-1 bg-[#272727]/5 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                            >
                              + 2 more
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

            {/* Primary Prompt Tab */}
            <TabsContent value="primary-prompt" className="space-y-6">
              {/* Primary Prompt Section */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 p-1.5 rounded-lg bg-purple-50 dark:bg-purple-400/10 text-purple-600 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-400/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-base">
                      Primary Prompt
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configure the main system prompt for your primary agent
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {primaryAgent ? (
                    <Controller
                      name="prompt"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="chat-prompt"
                          placeholder="Enter system prompt..."
                          className="min-h-[120px] resize-none"
                        />
                      )}
                    />
                  ) : (
                    <div className="min-h-[120px] rounded-md border border-dashed border-muted-foreground/20 flex items-center justify-center bg-muted/30">
                      <div className="text-center text-muted-foreground">
                        <Sparkles className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">
                          Select an agent to configure prompts
                        </p>
                      </div>
                    </div>
                  )}
                  {errors.prompt && (
                    <p className="text-xs text-red-500">
                      {errors.prompt.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This prompt defines how the AI assistant should behave and
                    respond
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
                      htmlFor="temperature"
                      className="text-sm font-medium"
                    >
                      Temperature
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {watchedValues.temperature}
                      </span>
                      {primaryAgent?.model_kwargs?.temperature ===
                        watchedValues.temperature && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                        >
                          From Agent
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Controller
                    name="temperature"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        id="temperature"
                        min={0}
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    )}
                  />
                  {errors.temperature && (
                    <p className="text-xs text-red-500">
                      {errors.temperature.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Controls creativity and randomness
                  </p>
                </div>

                {/* Max Tokens Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maxTokens" className="text-sm font-medium">
                      Max Tokens
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {watchedValues.max_tokens}
                      </span>
                      {primaryAgent?.model_kwargs?.max_tokens ===
                        watchedValues.max_tokens && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                        >
                          From Agent
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Controller
                    name="max_tokens"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        id="max_tokens"
                        min={100}
                        max={4096}
                        step={100}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    )}
                  />
                  {errors.max_tokens && (
                    <p className="text-xs text-red-500">
                      {errors.max_tokens.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Maximum length of AI responses
                  </p>
                </div>

                {/* Top-p Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="topP" className="text-sm font-medium">
                      Top-p
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {watchedValues.top_p.toFixed(2)}
                      </span>
                      {primaryAgent?.model_kwargs?.top_p ===
                        watchedValues.top_p && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                        >
                          From Agent
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Controller
                    name="top_p"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        id="topP"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    )}
                  />
                  {errors.top_p && (
                    <p className="text-xs text-red-500">
                      {errors.top_p.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Controls diversity of word choices (0.0 = focused, 1.0 =
                    diverse)
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Plugin Tab */}
            <TabsContent value="plugin" className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 stroke-[1.5px] stroke-[#272727]" />{' '}
                  <h3 className="text-paragraph !text-sm">Primary Prompt</h3>
                </div>
                <p className="text-paragraph !text-[#272727]/50">
                  The main agent that handles general queries and coordinates
                  with specialized agents.
                </p>

                <div className="space-y-1.5">
                  <Textarea
                    id="plugin-primary-prompt"
                    placeholder="You are a helpful assistant that specializes in..."
                    className="min-h-[240px] resize-none placeholder:text-[#272727]/50 text-[10px]"
                  />
                </div>
              </div>
            </TabsContent>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex gap-3 pt-6 border-t border-border mt-6 p-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={
                !isDirty || updateAgentMutation.isPending || !primaryAgent
              }
              className="flex-1"
            >
              {updateAgentMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div> */}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
