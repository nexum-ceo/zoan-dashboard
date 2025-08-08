'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Eye, Filter, Heart, Search, Star } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTab, setSelectedTab] = useState('Featured');

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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
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
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
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
                    <motion.div
                      key={agent.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -50, scale: 0.9 }}
                      transition={{
                        duration: 0.5,
                        delay: 1.0 + index * 0.1,
                        type: 'spring',
                        stiffness: 100,
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.02,
                        boxShadow:
                          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      layout
                    >
                      {/* Agent Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <motion.div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center text-white text-xl`}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          {agent.avatar}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <motion.h3
                              className="font-semibold text-gray-900 truncate"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.4,
                                delay: 1.2 + index * 0.1,
                              }}
                            >
                              {agent.name}
                            </motion.h3>
                            <motion.button
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                duration: 0.3,
                                delay: 1.3 + index * 0.1,
                              }}
                            >
                              <Heart className="w-5 h-5" />
                            </motion.button>
                          </div>
                          <motion.p
                            className="text-sm text-gray-600"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 1.25 + index * 0.1,
                            }}
                          >
                            by {agent.author}
                          </motion.p>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 1.35 + index * 0.1,
                        }}
                      >
                        <Badge variant="secondary" className="mb-3">
                          {agent.category}
                        </Badge>
                      </motion.div>

                      {/* Description */}
                      <motion.p
                        className="text-sm text-gray-600 mb-4 line-clamp-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                      >
                        {agent.description}
                      </motion.p>

                      {/* Pricing */}
                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 1.45 + index * 0.1,
                        }}
                      >
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
                      </motion.div>

                      {/* Tags */}
                      <motion.div
                        className="flex flex-wrap gap-1 mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.5 + index * 0.1 }}
                      >
                        {agent.tags.map((tag, tagIndex) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: 1.55 + index * 0.1 + tagIndex * 0.05,
                            }}
                          >
                            <Badge variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Stats */}
                      <motion.div
                        className="flex items-center gap-4 mb-4 text-sm text-gray-600"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.6 + index * 0.1 }}
                      >
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {agent.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {agent.rating}
                        </div>
                      </motion.div>

                      {/* Action Button */}
                      <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 1.65 + index * 0.1,
                        }}
                      >
                        {agent.type === 'Free' ? (
                          <motion.div
                            className="flex-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                              Install Free
                            </Button>
                          </motion.div>
                        ) : agent.type === 'Premium' ? (
                          <motion.div
                            className="flex-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button className="w-full bg-gray-900 hover:bg-gray-800">
                              Buy Now
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="flex-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                              Subscribe
                            </Button>
                          </motion.div>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button variant="outline" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
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
