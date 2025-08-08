'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { FC } from 'react';

type Agent = {
  id: number;
  name: string;
  author: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  type: string;
  period?: string;
  downloads: string;
  rating: number;
  tags: string[];
  avatar: string;
  color: string;
};

type AgentCardProps = {
  agent: Agent;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (agentId: number) => void;
};

export const AgentCard: FC<AgentCardProps> = ({
  agent,
  index,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <motion.div
      key={agent.id}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      whileHover={{
        y: -6,
        scale: 1.01,
        transition: { duration: 0.15, ease: 'easeOut' },
      }}
      transition={{
        duration: 0.5,
        delay: 1.0 + index * 0.1,
        type: 'spring',
        stiffness: 100,
        default: { duration: 0, ease: 'easeOut' },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
      layout
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
              className={`transition-colors ${
                isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
              onClick={() => onToggleFavorite(agent.id)}
              whileHover={{
                scale: 1.2,
                transition: { duration: 0.15 },
              }}
              whileTap={{
                scale: 0.9,
                transition: { duration: 0.1 },
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: 1.3 + index * 0.1,
                default: { duration: 0 },
              }}
            >
              <motion.div
                animate={{
                  scale: isFavorite ? [1, 1.3, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut',
                }}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite
                      ? 'fill-red-500 stroke-red-500'
                      : 'fill-none stroke-current'
                  }`}
                />
              </motion.div>
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
                Save ${(agent.originalPrice - agent.price).toFixed(2)}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${agent.price}
            </span>
            <span className="text-sm text-gray-600">{agent.period}</span>
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
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.15 },
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0 }}
          >
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Install Free
            </Button>
          </motion.div>
        ) : agent.type === 'Premium' ? (
          <motion.div
            className="flex-1"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.15 },
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0 }}
          >
            <Button className="w-full bg-gray-900 hover:bg-gray-800">
              Buy Now
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="flex-1"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.15 },
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0 }}
          >
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Subscribe
            </Button>
          </motion.div>
        )}
        <motion.div
          whileHover={{
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.15 },
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0 }}
        >
          <Button variant="outline" size="icon">
            <Eye className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
