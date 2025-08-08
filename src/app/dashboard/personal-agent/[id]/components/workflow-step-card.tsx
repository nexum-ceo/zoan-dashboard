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
        className={`p-6 ${
          step.status === 'completed'
            ? 'bg-green-50 border-green-200'
            : step.status === 'in-progress'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step.status === 'completed'
                  ? 'bg-green-600 text-white'
                  : step.status === 'in-progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-400 text-white'
              }`}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span className="text-lg font-bold">{step.id}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {step.title}
              </h3>
              <p className="text-gray-600 mb-3">{step.description}</p>

              {step.status === 'in-progress' && step.progress && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Processing...</span>
                    <span className="text-sm font-medium text-blue-600">
                      {step.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
                    <div
                      className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                    <span className="text-xs text-gray-500 ml-1">
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
                  className={
                    step.status === 'completed'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : step.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }
                >
                  {step.status === 'completed'
                    ? 'Completed'
                    : step.status === 'in-progress'
                    ? 'In Progress'
                    : 'Pending'}
                </Badge>
                {step.dependsOn && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>Depends on:</span>
                    <Badge variant="outline" className="text-xs">
                      #{step.dependsOn}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">
                {step.timeEstimate}
              </div>
            </div>
            <Button variant="ghost" size="icon">
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
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      )}
    </motion.div>
  );
};
