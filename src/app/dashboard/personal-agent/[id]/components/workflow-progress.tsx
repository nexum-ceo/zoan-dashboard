'use client';

import { Card } from '@/components/ui/card';
import { FC } from 'react';

export type WorkflowProgressProps = {
  completedSteps: number;
  totalSteps: number;
  overallProgress: number;
};

export const WorkflowProgress: FC<WorkflowProgressProps> = ({
  completedSteps,
  totalSteps,
  overallProgress,
}) => {
  return (
    <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 p-6 mt-8 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1 transition-colors duration-200">
            Workflow Progress
          </h3>
          <p className="text-muted-foreground transition-colors duration-200">
            {completedSteps} of {totalSteps} steps completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 transition-colors duration-200">
            {Math.round(overallProgress)}%
          </div>
          <div className="text-sm text-muted-foreground transition-colors duration-200">
            Complete
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full h-3 bg-blue-100 dark:bg-blue-900/50 rounded-full transition-colors duration-200">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </Card>
  );
};
