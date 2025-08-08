'use client';

import { Card } from '@/components/ui/card';

interface WorkflowProgressProps {
  completedSteps: number;
  totalSteps: number;
  overallProgress: number;
}

export function WorkflowProgress({
  completedSteps,
  totalSteps,
  overallProgress,
}: WorkflowProgressProps) {
  return (
    <Card className="bg-blue-50 border-blue-200 p-6 mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Workflow Progress
          </h3>
          <p className="text-gray-600">
            {completedSteps} of {totalSteps} steps completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {Math.round(overallProgress)}%
          </div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full h-3 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
