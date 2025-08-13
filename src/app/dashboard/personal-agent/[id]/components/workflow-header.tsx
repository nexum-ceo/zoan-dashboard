'use client';

import { Button } from '@/components/ui/button';
import { Code, Play, RotateCcw, Settings, Zap } from 'lucide-react';
import { FC } from 'react';

export type WorkflowHeaderProps = {
  completedSteps: number;
  totalSteps: number;
  overallProgress: number;
};

export const WorkflowHeader: FC<WorkflowHeaderProps> = ({
  completedSteps,
  totalSteps,
  overallProgress,
}) => {
  return (
    <div className="bg-card border-b border-border px-10 py-6 flex-shrink-0 transition-colors duration-200">
      <div className="mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center transition-colors duration-200">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1 transition-colors duration-200">
                Code Assistant Pro
              </h1>
              <p className="text-muted-foreground mb-4 transition-colors duration-200">
                Advanced coding assistant for React and Next.js development
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-colors duration-200" />
                  <span className="text-sm text-muted-foreground transition-colors duration-200">
                    Development
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground transition-colors duration-200">
                    {completedSteps} of {totalSteps} steps completed
                  </span>
                  <div className="w-16 h-2 bg-muted rounded-full transition-colors duration-200">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors duration-200">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200">
              <Play className="w-4 h-4 mr-2" />
              Run Workflow
            </Button>
            <Button
              variant="outline"
              className="border-border bg-card hover:bg-accent text-foreground transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              className="border-border bg-card hover:bg-accent text-foreground transition-colors duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
