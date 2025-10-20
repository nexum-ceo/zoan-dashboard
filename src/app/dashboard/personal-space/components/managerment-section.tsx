'use client';
import {
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { useGetAgentList, useGetInstalledAgent } from '@/queries/useAgent';
import { AgentType } from '@/types/agent';
import { IconLabel } from '@tabler/icons-react';
import { Codesandbox, Dot, Download, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AddPlusSquare from '../../../../../public/icon/add-plus-square';
import Search from '../../../../../public/icon/search';

// Agent Card Component
function AgentCard({
  agent,
}: // onToggleActive,
{
  agent: AgentType;
  onToggleActive?: (agentId: number) => void;
}) {
  return (
    <div className="flex flex-col justify-between w-full bg-white rounded-lg border border-[#272727]/5 p-2 pt-2.5 space-y-4 shadow-md">
      {/* Header */}
      <div className="w-full flex gap-2">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 w-7 h-7">
          {'🎮'}
        </div>

        <div className="flex-1">
          <h3 className="text-paragraph">{agent.name}</h3>
          <div className="flex items-center gap-1">
            <div className="text-tag-label !text-[#272727]/50">
              By {agent.email}
            </div>
            <Dot className="w-2 h-2 text-[#272727]/50" />
            <div className="flex items-center gap-1">
              <IconLabel className="w-3 h-3 text-primary-brand-darker-green" />
              <span className="text-primary-brand-darker-green text-[10px] font-normal">
                {(agent.categories ?? []).join(', ')}
              </span>
            </div>
          </div>
          {/* Version and Tags */}
          <div className="flex flex-wrap items-center gap-1 capitalize">
            {/* <span className="p-1.5 bg-[#272727]/5 text-tag-label rounded-full">
              {agent.version}
            </span> */}
            {(agent.tags?.slice(0, 3) ?? []).map((tag, index) => (
              <span
                key={index}
                className="p-1.5 bg-[#272727]/5 text-tag-label rounded-full"
              >
                {tag}
              </span>
            ))}
            {(agent.tags?.length ?? 0) > 3 && (
              <span className="p-1.5 bg-[#272727]/5 text-tag-label rounded-full">
                +{(agent.tags?.length ?? 0) - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[#272727] font-normal leading-3.5 ">
        {agent.description}
      </p>

      {/* Footer */}
      <div>
        {/* <div className="p-2">
          <div className="mb-3">
            <span className="text-[10px] text-[#272727]/50 font-medium">
              Chat Usage
            </span>
          </div>
          <div className="flex items-center justify-between gap-1">
            <Progress
              value={(agent.chatUsage.current / agent.chatUsage.total) * 100}
              className="h-2"
            />
            <div className="text-[10px] text-[#272727]/50 font-medium">
              <span className="text-primary-brand-darker-green">
                {agent.chatUsage.current}
              </span>
              /{agent.chatUsage.total}
            </div>
          </div>
        </div> */}
        {/* <Separator className="my-2 mx-auto" />
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={false}
              onCheckedChange={() => {}}
              className="data-[state=unchecked]:bg-[#272727]/10 data-[state=checked]:bg-primary-brand-darker-green disabled:bg-primary-brand-green"
              thumbClassName="data-[state=unchecked]:bg-[#272727]/50 data-[state=checked]:bg-white"
            />
            <span className="text-sm text-[#272727]">Active</span>
          </div>
          <div className="cursor-pointer">
            <EllipsisVertical />
          </div>
        </div> */}
      </div>
    </div>
  );
}

type ManagementTab = 'my-agents' | 'installed' | 'ai-dapps';

export default function ManagementSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ManagementTab>('my-agents');

  // Fetch data conditionally based on active tab
  const { data: installedAgents, isLoading: isLoadingInstalled } =
    useGetInstalledAgent();
  const { data: agentList, isLoading: isLoadingMyAgents } = useGetAgentList();

  const safeInstalledAgents = installedAgents?.data?.data ?? [];
  const safeAgentList = agentList?.data?.data ?? [];

  const handleInstallAgentClick = () => {
    router.push('/dashboard/community');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ManagementTab);
  };
  // const handleToggleActive = (agentId: number) => {
  //   setAgents((prevAgents) =>
  //     prevAgents.map((agent) =>
  //       agent.id === agentId ? { ...agent, isActive: !agent.isActive } : agent,
  //     ),
  //   );
  // };

  return (
    <div className="space-y-4">
      {/*Header Bar*/}
      <div className="text-[#272727] text-body-b1">Management</div>
      {/*Tabs and Content*/}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full bg-white"
      >
        <div className="flex items-center justify-between">
          <TabsList className="bg-white border border-[#272727]/5">
            <TabsTrigger
              value="my-agents"
              className="px-3 py-2 text-[#272727] data-[state=active]:bg-primary-brand-green"
            >
              <Sparkles className="w-4 h-4" />
              My Agents
            </TabsTrigger>
            <TabsTrigger
              value="installed"
              className="px-3 py-2 text-[#272727] data-[state=active]:bg-primary-brand-green"
            >
              <Download className="w-4 h-4" />
              Installed Agents
            </TabsTrigger>
            <TabsTrigger
              value="ai-dapps"
              className="px-3 py-2 text-[#272727] data-[state=active]:bg-primary-brand-green"
            >
              <Codesandbox className="w-4 h-4" />
              AI dApps
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <div className="relative w-80">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#272727]" />
              <Input
                placeholder="Search all AI agents"
                className="w-full h-6.5 px-2 py-1.5 pl-8 bg-gray-100 border-0 rounded-lg text-xs placeholder:text-[#272727]/50"
              />
            </div>
            <Button size={'l'} onClick={handleInstallAgentClick}>
              <AddPlusSquare />
              Install Agent
            </Button>
          </div>
        </div>

        <TabsContent value="my-agents" className="mt-6">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {isLoadingMyAgents ? (
                <div className="col-span-full text-center text-sm text-[#272727]/50">
                  Loading my agents...
                </div>
              ) : safeAgentList.length > 0 ? (
                safeAgentList.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))
              ) : (
                <div className="col-span-full text-center text-sm text-[#272727]/50">
                  No agents found
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="installed" className="mt-6">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {isLoadingInstalled ? (
                <div className="col-span-full text-center text-sm text-[#272727]/50">
                  Loading installed agents...
                </div>
              ) : safeInstalledAgents.length > 0 ? (
                safeInstalledAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))
              ) : (
                <div className="col-span-full text-center text-sm text-[#272727]/50">
                  No installed agents found
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-dapps" className="mt-6">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="col-span-full text-center text-sm text-[#272727]/50">
                AI dApps coming soon...
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
