'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { type WorkflowStep } from './workflow-step-card';

export type WorkflowGridViewProps = {
  steps: WorkflowStep[];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
    },
  },
};

const getItemVariants = (index: number, totalColumns: number = 3) => {
  // Calc row and column
  const row = Math.floor(index / totalColumns);
  const col = index % totalColumns;

  // Delay based on position: left to right, top to bottom
  // Row delay: wait for previous row to finish + extra delay
  // Column delay: stagger within the same row
  const rowDelay = row * 0.8; // Each row waits 0.8s (0.6s animation + 0.2s extra)
  const columnDelay = col * 0.15; // Stagger within row
  const delay = rowDelay + columnDelay;

  // Calculate distance from start of row to current position
  // Each column is approximately 300px + gap (assuming standard card width + gap)
  const slideDistance = col * -350; // Negative because we slide from left

  return {
    hidden: {
      opacity: 0,
      x: slideDistance, // Slide from start of row to current position
      y: 0, // Keep same row level
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        type: 'tween' as const,
      },
    },
  };
};

export const WorkflowGridView: FC<WorkflowGridViewProps> = ({ steps }) => {
  const [columnsCount, setColumnsCount] = useState(3);

  useEffect(() => {
    const updateColumnsCount = () => {
      if (window.innerWidth >= 1024) {
        setColumnsCount(3); // lg breakpoint
      } else if (window.innerWidth >= 768) {
        setColumnsCount(2); // md breakpoint
      } else {
        setColumnsCount(1); // mobile
      }
    };

    // Set initial value
    updateColumnsCount();

    // Add event listener
    window.addEventListener('resize', updateColumnsCount);

    // Cleanup
    return () => window.removeEventListener('resize', updateColumnsCount);
  }, []);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          variants={getItemVariants(index, columnsCount)}
          whileHover={{
            scale: 1.02,
            y: -5,
            transition: { duration: 0.2 },
          }}
          className="h-full"
        >
          <Card className="p-6 bg-card border border-border hover:shadow-md transition-all duration-200 h-full flex flex-col min-h-[320px]">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                  step.status === 'completed'
                    ? 'bg-green-600 dark:bg-green-500 text-white'
                    : step.status === 'in-progress'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-500 dark:bg-gray-400 text-white'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1 text-lg transition-colors duration-200">
                  {step.title}
                </h3>
                <div className="text-sm text-muted-foreground mb-2 transition-colors duration-200">
                  {step.timeEstimate}
                </div>
              </div>
            </div>

            {/* Content area - grows to fill available space */}
            <div className="flex-1 flex flex-col">
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed flex-1 transition-colors duration-200">
                {step.description}
              </p>

              {/* Progress section - fixed height area */}
              <div className="mb-4 min-h-[60px] flex flex-col justify-end">
                {step.status === 'in-progress' && step.progress && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground transition-colors duration-200">
                        Progress
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors duration-200">
                        {step.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full transition-colors duration-200">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-1 h-1 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse transition-colors duration-200"></div>
                      <div
                        className="w-1 h-1 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse transition-colors duration-200"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse transition-colors duration-200"
                        style={{ animationDelay: '0.4s' }}
                      ></div>
                      <span className="text-xs text-muted-foreground ml-1 transition-colors duration-200">
                        in progress
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer - always at bottom */}
            <div className="flex items-center justify-between mt-auto">
              <Badge
                variant={
                  step.status === 'completed'
                    ? 'default'
                    : step.status === 'in-progress'
                    ? 'secondary'
                    : 'outline'
                }
                className={`transition-colors duration-200 ${
                  step.status === 'completed'
                    ? 'bg-primary text-primary-foreground'
                    : step.status === 'in-progress'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                }`}
              >
                {step.status === 'completed'
                  ? 'completed'
                  : step.status === 'in-progress'
                  ? 'in progress'
                  : 'pending'}
              </Badge>
              {step.dependsOn && (
                <div className="text-xs text-muted-foreground transition-colors duration-200">
                  Depends on #{step.dependsOn}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
