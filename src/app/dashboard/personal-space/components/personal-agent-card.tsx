import { InstalledAgent } from '@/app/dashboard/personal-space/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Edit,
  ExternalLink,
  MoreHorizontal,
  Settings,
  Trash2,
  Workflow,
} from 'lucide-react';
import { motion } from 'motion/react';
import { FC } from 'react';

type PersonalAgentCardProps = {
  agent: InstalledAgent;
  onAgentClick: (agent: InstalledAgent) => void;
};

export const PersonalAgentCard: FC<PersonalAgentCardProps> = ({
  agent,
  onAgentClick,
}) => {
  const usagePercentage = Math.min((agent.totalChats / 20) * 100, 100); // Max 20 chats = 100%

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
      transition={{
        duration: 0.4,
        type: 'spring',
        stiffness: 100,
      }}
      className="cursor-pointer"
      onClick={() => onAgentClick(agent)}
    >
      <Card className="border border-gray-200 hover:shadow-xl transition-shadow duration-300 bg-white">
        <CardContent className="p-6">
          {/* Header with Agent Info and Actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center text-white text-xl shadow-lg`}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {agent.avatar}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <motion.h3
                    className="font-bold text-gray-900 text-lg"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {agent.name}
                  </motion.h3>
                  {agent.isActive && (
                    <motion.div
                      className="flex items-center gap-1"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      {agent.hasWorkflow && (
                        <motion.div
                          className="flex items-center gap-1 text-xs text-green-600 font-medium"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Workflow className="w-3 h-3" />
                          <span>Workflow</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
                <motion.p
                  className="text-sm text-gray-600 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {agent.version}
                </motion.p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Badge variant="secondary" className="text-xs font-medium">
              {agent.category}
            </Badge>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-sm text-gray-600 mb-4 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {agent.description}
          </motion.p>

          {/* Usage Section */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Usage</span>
              <span className="text-sm font-bold text-gray-900">
                {agent.totalChats} chats
              </span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="origin-left"
            >
              <Progress value={usagePercentage} className="h-2" />
            </motion.div>
          </motion.div>

          {/* Installation and Usage Info */}
          <motion.div
            className="flex items-center justify-between text-xs text-gray-500 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <span>Installed {agent.installedDate}</span>
            <span>Used {agent.lastUsed}</span>
          </motion.div>

          {/* Status and Action Buttons */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Toggle Switch and Status */}
            <div className="flex items-center gap-3">
              <motion.div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  agent.isActive ? 'bg-gray-900' : 'bg-gray-300'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform"
                  animate={{
                    x: agent.isActive ? 24 : 4,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.div>
              <span className="text-sm font-medium text-gray-700">
                {agent.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Workflow Link */}
          {agent.hasWorkflow && (
            <motion.div
              className="mt-4 pt-4 border-t border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <motion.button
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <ExternalLink className="w-3 h-3" />
                Click to view processing workflow
              </motion.button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
