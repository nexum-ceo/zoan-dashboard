'use client';

import { PersonalAgentCard } from '@/app/dashboard/personal-space/components/personal-agent-card';
import { CountUp } from '@/components/count-up';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Clock, Plus, Search, TrendingUp, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type InstalledAgent = {
  id: number;
  name: string;
  version: string;
  category: string;
  description: string;
  isActive: boolean;
  totalChats: number;
  usageTime: string;
  installedDate: string;
  lastUsed: string;
  avatar: string;
  color: string;
  hasWorkflow?: boolean;
};

const installedAgents: InstalledAgent[] = [
  {
    id: 1,
    name: 'Code Assistant Pro',
    version: 'v2.1.0',
    category: 'Development',
    description: 'Advanced coding assistant for React and Next.js development',
    isActive: true,
    totalChats: 15,
    usageTime: '2 days ago',
    installedDate: '2 days ago',
    lastUsed: '5 minutes ago',
    avatar: '👨‍💻',
    color: 'from-blue-500 to-purple-600',
    hasWorkflow: true,
  },
  {
    id: 2,
    name: 'UI/UX Designer',
    version: 'v1.5.2',
    category: 'Design',
    description: 'Creates beautiful user interfaces and design systems',
    isActive: true,
    totalChats: 8,
    usageTime: '1 week ago',
    installedDate: '1 week ago',
    lastUsed: '2 hours ago',
    avatar: '🎨',
    color: 'from-pink-500 to-purple-600',
  },
  {
    id: 3,
    name: 'Database Architect',
    version: 'v1.0.1',
    category: 'Backend',
    description: 'Designs and optimizes database schemas and queries',
    isActive: false,
    totalChats: 5,
    usageTime: '3 days ago',
    installedDate: '3 days ago',
    lastUsed: '1 day ago',
    avatar: '🗄️',
    color: 'from-green-500 to-blue-600',
  },
  {
    id: 4,
    name: 'Game Generator',
    version: 'v1.2.0',
    category: 'Gaming',
    description: 'Advanced AI agent that creates 2D and 3D games',
    isActive: false,
    totalChats: 3,
    usageTime: '1 week ago',
    installedDate: '1 week ago',
    lastUsed: '3 days ago',
    avatar: '🎮',
    color: 'from-purple-500 to-pink-600',
  },
];

export default function PersonalSpace() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();
  const totalChats = installedAgents.reduce(
    (sum, agent) => sum + agent.totalChats,
    0,
  );
  const activeAgents = installedAgents.filter((agent) => agent.isActive).length;
  const topCategory = 'Development';

  const filteredAgents = installedAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAgentClick = (agent: InstalledAgent) => {
    if (agent.hasWorkflow) {
      router.push(`/dashboard/personal-agent/${agent.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Header */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground transition-colors duration-200">
                Personal Space
              </h1>
              <p className="text-muted-foreground mt-1 transition-colors duration-200">
                Manage your installed agents and workspace settings
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-card border-border transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-foreground transition-colors duration-200">
                      <CountUp end={totalChats} duration={2000} />
                    </p>
                    <p className="text-sm text-muted-foreground transition-colors duration-200">
                      Total Chats
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-foreground transition-colors duration-200">
                      <CountUp end={activeAgents} duration={2200} />
                    </p>
                    <p className="text-sm text-muted-foreground transition-colors duration-200">
                      Active Agents
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-foreground transition-colors duration-200">
                      <CountUp
                        end={12.5}
                        duration={2400}
                        decimals={1}
                        suffix="h"
                      />
                    </p>
                    <p className="text-sm text-muted-foreground transition-colors duration-200">
                      Usage Time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-foreground transition-colors duration-200">
                      {topCategory}
                    </p>
                    <p className="text-sm text-muted-foreground transition-colors duration-200">
                      Top Category
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="agents" className="w-full">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between mb-6">
            <TabsList className="p-1 h-auto rounded-lg shadow-sm transition-colors duration-200">
              <TabsTrigger
                value="agents"
                className="font-medium px-4 py-2 data-[state=active]:shadow-sm rounded-md transition-colors duration-200"
              >
                My Agents
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="font-medium px-4 py-2 data-[state=active]:shadow-sm rounded-md transition-colors duration-200"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="font-medium px-4 py-2 data-[state=active]:shadow-sm rounded-md transition-colors duration-200"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Install Agent
            </Button>
          </div>

          {/* Agents Tab Content */}
          <TabsContent value="agents" className="mt-0">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search your agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base bg-card border-border text-foreground placeholder:text-muted-foreground transition-colors duration-200"
              />
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <PersonalAgentCard
                  key={agent.id}
                  agent={agent}
                  onAgentClick={handleAgentClick}
                />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab Content */}
          <TabsContent value="analytics" className="mt-0 min-h-[60vh]">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground transition-colors duration-200">
                Analytics dashboard will be displayed here
              </p>
            </div>
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="mt-0 min-h-[60vh]">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground transition-colors duration-200">
                Settings panel will be displayed here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
