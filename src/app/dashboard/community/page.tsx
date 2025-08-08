'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Eye, Filter, Heart, Search, Star } from 'lucide-react';
import { useState } from 'react';

// Mock data for AI agents
const mockAgents = [
  {
    id: 1,
    name: 'Game Generator AI',
    author: 'GameDev Community',
    category: 'Gaming',
    description:
      'Advanced AI agent that creates 2D and 3D games with physics, animations, and interactive gameplay',
    price: 29.99,
    originalPrice: 39.99,
    type: 'Premium',
    downloads: '5.2K',
    rating: 4.9,
    tags: ['Game Development', 'Physics', '2D/3D'],
    avatar: '🎮',
    color: 'from-purple-500 to-blue-600',
  },
  {
    id: 2,
    name: 'Code Reviewer Pro',
    author: 'DevTeam',
    category: 'Development',
    description:
      'AI agent that reviews code for best practices, security issues, and performance optimizations',
    price: 9.99,
    type: 'Subscription',
    period: '/month',
    downloads: '8.7K',
    rating: 4.8,
    tags: ['Code Review', 'Security', 'Best Practices'],
    avatar: '👨‍💻',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 3,
    name: 'UI/UX Designer',
    author: 'DesignStudio',
    category: 'Design',
    description:
      'Creates beautiful user interfaces and comprehensive design systems with accessibility in mind',
    price: 0,
    type: 'Free',
    downloads: '6.3K',
    rating: 4.7,
    tags: ['UI Design', 'UX Research', 'Accessibility'],
    avatar: '🎨',
    color: 'from-pink-500 to-purple-600',
  },
];

const categories = [
  { name: 'All', count: 1247 },
  { name: 'Development', count: 423 },
  { name: 'Design', count: 312 },
  { name: 'Gaming', count: 189 },
  { name: 'Productivity', count: 156 },
  { name: 'Education', count: 167 },
];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTab, setSelectedTab] = useState('Featured');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600 text-lg">
            Discover and install AI agents created by the community
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search agents..."
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button variant="outline" className="h-12 px-6">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.name
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
            <TabsTrigger value="Featured">Featured</TabsTrigger>
            <TabsTrigger value="Trending">Trending</TabsTrigger>
            <TabsTrigger value="Recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="Featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
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
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">by {agent.author}</p>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <Badge variant="secondary" className="mb-3">
                    {agent.category}
                  </Badge>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {agent.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-4">
                    {agent.type === 'Free' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Free
                      </Badge>
                    ) : agent.type === 'Premium' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 line-through">
                          ${agent.originalPrice}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          ${agent.price}
                        </span>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          Premium
                        </Badge>
                        {agent.originalPrice && (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Save $
                            {(agent.originalPrice - agent.price).toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${agent.price}
                        </span>
                        <span className="text-sm text-gray-600">
                          {agent.period}
                        </span>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Subscription
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {agent.downloads}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {agent.rating}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2">
                    {agent.type === 'Free' ? (
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        Install Free
                      </Button>
                    ) : agent.type === 'Premium' ? (
                      <Button className="flex-1 bg-gray-900 hover:bg-gray-800">
                        Buy Now
                      </Button>
                    ) : (
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Subscribe
                      </Button>
                    )}
                    <Button variant="outline" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="Trending" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-gray-500">
                Trending agents will be displayed here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="Recent" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-gray-500">
                Recent agents will be displayed here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
