'use client';

import { Button } from '@/components/ui/button';
import { Code, Play, RotateCcw, Settings, Zap } from 'lucide-react';

interface WorkflowHeaderProps {
  completedSteps: number;
  totalSteps: number;
  overallProgress: number;
}

export function WorkflowHeader({
  completedSteps,
  totalSteps,
  overallProgress,
}: WorkflowHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-10 py-6 flex-shrink-0">
      <div className="mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Code Assistant Pro
              </h1>
              <p className="text-gray-600 mb-4">
                Advanced coding assistant for React and Next.js development
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Development</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {completedSteps} of {totalSteps} steps completed
                  </span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-black text-white hover:bg-gray-800">
              <Play className="w-4 h-4 mr-2" />
              Run Workflow
            </Button>
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
