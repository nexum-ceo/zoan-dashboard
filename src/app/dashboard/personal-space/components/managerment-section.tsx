'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetInstalledAgent } from '@/queries/useAgent';
import { AgentType } from '@/types/agent';
import { IconLabel } from '@tabler/icons-react';
import { Dot } from 'lucide-react';
import { useState } from 'react';
import AddPlusSquare from '../../../../../public/icon/add-plus-square';
import Search from '../../../../../public/icon/search';

// Mock data for 12 agents
const agentsData = [
  {
    id: 1,
    title: 'Generate Game AI',
    publisher: 'GamingStudio',
    category: 'Gaming',
    version: 'V1.2.1',
    tags: ['Game development', '2D/3D', 'Physics', 'AI', 'Unity'],
    description: 'Advanced coding assistant for React and Next.js development',
    chatUsage: { current: 15, total: 100 },
    isActive: true,
    icon: '🎮',
  },
  {
    id: 2,
    title: 'Code Assistant Pro',
    publisher: 'DevTools Inc',
    category: 'Development',
    version: 'V2.0.5',
    tags: ['Programming', 'Debugging', 'Code Review', 'Best Practices'],
    description:
      'Professional coding assistant for multiple programming languages',
    chatUsage: { current: 45, total: 100 },
    isActive: true,
    icon: '💻',
  },
  {
    id: 3,
    title: 'Design Helper',
    publisher: 'CreativeStudio',
    category: 'Design',
    version: 'V1.8.2',
    tags: ['UI/UX', 'Figma', 'Prototyping', 'Color Theory'],
    description:
      'AI-powered design assistant for creating beautiful interfaces',
    chatUsage: { current: 23, total: 100 },
    isActive: false,
    icon: '🎨',
  },
  {
    id: 4,
    title: 'Data Analyst',
    publisher: 'DataCorp',
    category: 'Analytics',
    version: 'V3.1.0',
    tags: ['Data Science', 'Python', 'SQL', 'Visualization'],
    description: 'Advanced data analysis and visualization assistant',
    chatUsage: { current: 67, total: 100 },
    isActive: true,
    icon: '📊',
  },
  {
    id: 5,
    title: 'Content Writer',
    publisher: 'WriteWell',
    category: 'Writing',
    version: 'V1.5.3',
    tags: ['Content', 'SEO', 'Blogging', 'Marketing'],
    description: 'Professional content creation and writing assistant',
    chatUsage: { current: 12, total: 100 },
    isActive: true,
    icon: '✍️',
  },
  {
    id: 6,
    title: 'Security Scanner',
    publisher: 'SecureTech',
    category: 'Security',
    version: 'V2.3.1',
    tags: ['Security', 'Vulnerability', 'Penetration Testing', 'Compliance'],
    description: 'Comprehensive security analysis and vulnerability scanner',
    chatUsage: { current: 89, total: 100 },
    isActive: false,
    icon: '🔒',
  },
];

// Agent Card Component
function AgentCard({
  agent,
  onToggleActive,
}: {
  agent: AgentType;
  onToggleActive: (agentId: number) => void;
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
                {agent.categories.join(', ')}
              </span>
            </div>
          </div>
          {/* Version and Tags */}
          <div className="flex flex-wrap items-center gap-1 capitalize">
            {/* <span className="p-1.5 bg-[#272727]/5 text-tag-label rounded-full">
              {agent.version}
            </span> */}
            {agent.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="p-1.5 bg-[#272727]/5 text-tag-label rounded-full"
              >
                {tag}
              </span>
            ))}
            {agent.tags.length > 3 && (
              <span className="p-1.5 bg-[#272727]/5 text-tag-label rounded-full">
                +{agent.tags.length - 3} more
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

export default function ManagementSection() {
  const [agents, setAgents] = useState(agentsData);
  const { data: installedAgents } = useGetInstalledAgent();
  const handleToggleActive = (agentId: number) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent.id === agentId ? { ...agent, isActive: !agent.isActive } : agent,
      ),
    );
  };

  return (
    <div className="space-y-4">
      {/*Header Bar*/}
      <div className="text-[#272727] text-body-b1">Managerment</div>
      <div className="flex items-center justify-between">
        <div>
          <Tabs defaultValue="discover" className="w-full bg-white">
            <TabsList className="bg-white border border-[#272727]/5">
              <TabsTrigger
                value="discover"
                className="px-3 py-2 text-[#272727]  data-[state=active]:bg-primary-brand-green"
              >
                Installed
              </TabsTrigger>
              <TabsTrigger
                value="2d"
                className="px-3 py-2 text-[#272727]  data-[state=active]:bg-primary-brand-green"
              >
                AI dApps
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative w-80 mx-auto">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#272727]" />
            <Input
              placeholder="Search all AI agents"
              className="w-full h-6.5 px-2 py-1.5 pl-8 bg-gray-100 border-0 rounded-lg text-xs placeholder:text-[#272727]/50"
            />
          </div>
          <Button size={'l'}>
            <AddPlusSquare />
            Install Agent
          </Button>
        </div>
      </div>

      {/*Agent Card*/}
      <div className="space-y-3">
        {/* Agent Card List */}
        <div className="text-sm font-medium leading-3.5 text-[#272727]">
          Agents
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {installedAgents?.data.data.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>

        {/* Agent Card List */}
        {/* <div className="text-sm font-medium leading-3.5 text-[#272727]">
          AI DApps
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleActive={handleToggleActive}
            />
          ))} */}
        </div>
      </div>
    </div>
  );
}
