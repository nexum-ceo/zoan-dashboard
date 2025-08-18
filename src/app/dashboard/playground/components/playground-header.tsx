'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gamepad2, MessageSquare, Settings } from 'lucide-react';

interface PlaygroundHeaderProps {
  selectedAgent?: {
    name?: string;
    description?: string;
  };
  activePanel?: 'settings' | 'explore' | null;
  onTogglePanel?: (panel: 'settings' | 'explore' | null) => void;
}

export function PlaygroundHeader({
  selectedAgent,
  activePanel,
  onTogglePanel,
}: PlaygroundHeaderProps) {
  return (
    <div className="w-full px-6 py-4 border-b border-border bg-background">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-500/10">
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-foreground">
              {selectedAgent?.name || 'No Agent Selected'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedAgent?.description || 'Please select an agent'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {onTogglePanel && (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onTogglePanel?.(
                      activePanel === 'explore' ? null : 'explore',
                    )
                  }
                  className={`transition-all duration-300 ${
                    activePanel === 'explore'
                      ? 'bg-accent text-accent-foreground shadow-lg ring-2 ring-ring/30'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onTogglePanel?.(
                      activePanel === 'settings' ? null : 'settings',
                    )
                  }
                  className={`transition-all duration-300 ${
                    activePanel === 'settings'
                      ? 'bg-accent text-accent-foreground shadow-lg ring-2 ring-ring/30'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </motion.div>
            </>
          )}
          {/* {onTogglePanel && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                onTogglePanel?.(activePanel === 'settings' ? null : 'settings')
              }
              className={`transition-all duration-300 ${
                activePanel === 'settings'
                  ? 'bg-accent text-accent-foreground shadow-lg ring-2 ring-ring/30'
                  : 'hover:bg-muted'
              }`}
            >
                <Settings className="w-4 h-4" />
              </Button>
            </motion.div>
          )} */}
        </div>
      </div>
    </div>
  );
}
