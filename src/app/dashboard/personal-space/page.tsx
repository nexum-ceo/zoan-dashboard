'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Activity,
  Clock,
  Edit,
  ExternalLink,
  MessageSquare,
  Plus,
  Power,
  PowerOff,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

type InstalledAgent = {
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
  const [activeTab, setActiveTab] = useState<
    'agents' | 'analytics' | 'settings'
  >('agents');
  const [searchQuery, setSearchQuery] = useState('');

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
      // Navigate to workflow detail - for now just log
      console.log(`Navigate to workflow for ${agent.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Personal Space
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your installed agents and workspace settings
              </p>
            </div>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Install Agent
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {totalChats}
                    </p>
                    <p className="text-sm text-gray-600">Total Chats</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {activeAgents}
                    </p>
                    <p className="text-sm text-gray-600">Active Agents</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">12.5h</p>
                    <p className="text-sm text-gray-600">Usage Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {topCategory}
                    </p>
                    <p className="text-sm text-gray-600">Top Category</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'agents'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Agents
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {activeTab === 'agents' && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search your agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        )}

        {/* Agents Grid */}
        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleAgentClick(agent)}
              >
                <CardContent className="p-6">
                  {/* Agent Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center text-white text-xl`}
                    >
                      {agent.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {agent.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {agent.isActive ? (
                            <Power className="w-4 h-4 text-green-500" />
                          ) : (
                            <PowerOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{agent.version}</p>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <Badge variant="secondary" className="mb-3">
                    {agent.category}
                  </Badge>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {agent.description}
                  </p>

                  {/* Usage Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{agent.totalChats} chats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Used {agent.lastUsed}</span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={agent.isActive ? 'default' : 'secondary'}
                        className={
                          agent.isActive ? 'bg-green-100 text-green-800' : ''
                        }
                      >
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      {agent.hasWorkflow && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Workflow Link */}
                  {agent.hasWorkflow && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Click to view processing workflow
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Analytics dashboard will be displayed here
            </p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Settings panel will be displayed here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
