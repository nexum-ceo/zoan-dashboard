'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronDown, MoreHorizontal } from 'lucide-react';
import { FC, ReactNode } from 'react';

export type WorkflowStep = {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  timeEstimate: string;
  progress?: number;
  icon: ReactNode;
  dependsOn?: number;
};

export type WorkflowStepCardProps = {
  step: WorkflowStep;
  isLast: boolean;
  index?: number;
};

export const WorkflowStepCard: FC<WorkflowStepCardProps> = ({
  step,
  isLast,
  index = 0,
}) => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.25, 0, 1] as const,
      }}
    >
      <Card
        className={`p-6 transition-all duration-200 ${
          step.status === 'completed'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : step.status === 'in-progress'
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                step.status === 'completed'
                  ? 'bg-green-600 dark:bg-green-500 text-white'
                  : step.status === 'in-progress'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-500 dark:bg-gray-400 text-white'
              }`}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span className="text-lg font-bold">{step.id}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1 transition-colors duration-200">
                {step.title}
              </h3>
              <p className="text-muted-foreground mb-3 transition-colors duration-200">
                {step.description}
              </p>

              {step.status === 'in-progress' && step.progress && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground transition-colors duration-200">
                      Processing...
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
                  <div className="flex items-center gap-1 mt-1">
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
                      Estimated 5-10 seconds remaining
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
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
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
                      : step.status === 'in-progress'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {step.status === 'completed'
                    ? 'Completed'
                    : step.status === 'in-progress'
                    ? 'In Progress'
                    : 'Pending'}
                </Badge>
                {step.dependsOn && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground transition-colors duration-200">
                    <span>Depends on:</span>
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-foreground transition-colors duration-200"
                    >
                      #{step.dependsOn}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1 transition-colors duration-200">
                {step.timeEstimate}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Connecting Arrow */}
      {!isLast && (
        <motion.div
          className="flex justify-center py-2"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.4,
            delay: index * 0.1 + 0.3,
            ease: 'easeOut',
          }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground transition-colors duration-200" />
        </motion.div>
      )}
    </motion.div>
  );
};
