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
  const delay = (row * totalColumns + col) * 0.15;

  return {
    hidden: {
      opacity: 0,
      y: 40,
      x: -20,
      scale: 0.9,
      rotateY: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
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
          <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col min-h-[320px]">
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

            {/* Content area - grows to fill available space */}
            <div className="flex-1 flex flex-col">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-1">
                {step.description}
              </p>

              {/* Progress section - fixed height area */}
              <div className="mb-4 min-h-[60px] flex flex-col justify-end">
                {step.status === 'in-progress' && step.progress && (
                  <>
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
