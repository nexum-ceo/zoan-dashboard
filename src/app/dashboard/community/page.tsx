'use client';

import { AgentCard } from '@/app/dashboard/community/components/agent-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTab, setSelectedTab] = useState<string>('Featured');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleFavorite = (agentId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(agentId)) {
        newFavorites.delete(agentId);
      } else {
        newFavorites.add(agentId);
      }
      return newFavorites;
    });
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.h1
            className="text-4xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Community
          </motion.h1>
          <motion.p
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Discover and install AI agents created by the community
          </motion.p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="flex gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            className="relative flex-1"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search agents..."
              className="pl-10 h-12 text-base"
            />
          </motion.div>
          <motion.div
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.15 },
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0 }}
          >
            <Button variant="outline" className="h-12 px-6">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </motion.div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          className="flex gap-2 mb-6 overflow-x-auto"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.name
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
                y: -2,
                transition: { duration: 0.15 },
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                duration: 0.4,
                delay: 0.6 + index * 0.1,
                default: { duration: 0 },
              }}
              layout
            >
              {category.name} ({category.count})
            </motion.button>
          ))}
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
                <TabsTrigger value="Featured">Featured</TabsTrigger>
                <TabsTrigger value="Trending">Trending</TabsTrigger>
                <TabsTrigger value="Recent">Recent</TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="Featured" className="space-y-6">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <AnimatePresence>
                  {mockAgents.map((agent, index) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      index={index}
                      isFavorite={favorites.has(agent.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </TabsContent>

            <TabsContent value="Trending" className="space-y-6">
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.p
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Trending agents will be displayed here
                </motion.p>
              </motion.div>
            </TabsContent>

            <TabsContent value="Recent" className="space-y-6">
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.p
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Recent agents will be displayed here
                </motion.p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}
