'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { FC } from 'react';
import { type WorkflowStep } from './workflow-step-card';

export type WorkflowGridViewProps = {
  steps: WorkflowStep[];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.25, 0, 1] as const,
    },
  },
};

export const WorkflowGridView: FC<WorkflowGridViewProps> = ({ steps }) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {steps.map((step) => (
        <motion.div key={step.id} variants={itemVariants}>
          <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.status === 'completed'
                    ? 'bg-green-600 text-white'
                    : step.status === 'in-progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-400 text-white'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                  {step.title}
                </h3>
                <div className="text-sm text-gray-600 mb-2">
                  {step.timeEstimate}
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {step.description}
            </p>

            {step.status === 'in-progress' && step.progress && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
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
                <div className="flex items-center gap-1 mt-2">
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
                    in progress
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge
                variant={
                  step.status === 'completed'
                    ? 'default'
                    : step.status === 'in-progress'
                    ? 'secondary'
                    : 'outline'
                }
                className={`${
                  step.status === 'completed'
                    ? 'bg-black text-white'
                    : step.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {step.status === 'completed'
                  ? 'completed'
                  : step.status === 'in-progress'
                  ? 'in progress'
                  : 'pending'}
              </Badge>
              {step.dependsOn && (
                <div className="text-xs text-gray-500">
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
