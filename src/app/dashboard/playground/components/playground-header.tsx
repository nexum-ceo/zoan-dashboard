'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gamepad2, MessageSquare, Settings } from 'lucide-react';

interface PlaygroundHeaderProps {
  selectedAgent?: {
    name?: string;
    description?: string;
  };
  activePanel: 'settings' | 'explore' | null;
  onTogglePanel: (panel: 'settings' | 'explore' | null) => void;
}

export function PlaygroundHeader({
  selectedAgent,
  activePanel,
  onTogglePanel,
}: PlaygroundHeaderProps) {
  return (
    <div className="w-full px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-900">
              {selectedAgent?.name || 'No Agent Selected'}
            </h2>
            <p className="text-xs text-gray-500">
              {selectedAgent?.description || 'Please select an agent'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                onTogglePanel(activePanel === 'explore' ? null : 'explore')
              }
              className={`transition-all duration-300 ${
                activePanel === 'explore'
                  ? 'bg-blue-100 text-blue-600 shadow-lg ring-2 ring-blue-200'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                onTogglePanel(activePanel === 'settings' ? null : 'settings')
              }
              className={`transition-all duration-300 ${
                activePanel === 'settings'
                  ? 'bg-blue-100 text-blue-600 shadow-lg ring-2 ring-blue-200'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
