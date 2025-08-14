'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3, Workflow } from 'lucide-react';
import { FC } from 'react';

export type WorkflowNavigationProps = {
  inProgressSteps: number;
  activeTab?: 'workflow' | 'grid';
  onTabChange?: (value: 'workflow' | 'grid') => void;
};

export const WorkflowNavigation: FC<WorkflowNavigationProps> = ({
  inProgressSteps,
  activeTab = 'workflow',
  onTabChange,
}) => {
  return (
    <div className="bg-muted/50 px-20 py-4 flex-shrink-0 transition-colors duration-200">
      <div className="mx-auto">
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              onTabChange?.(value as 'workflow' | 'grid')
            }
            className="w-fit"
          >
            <TabsList className="p-1 h-auto rounded-lg shadow-sm transition-colors duration-200">
              <TabsTrigger
                value="workflow"
                className="flex items-center gap-2 font-medium px-3 py-2 data-[state=active]:shadow-sm rounded-md transition-colors duration-200"
              >
                <Workflow className="w-4 h-4" />
                Workflow Diagram
              </TabsTrigger>
              <TabsTrigger
                value="grid"
                className="flex items-center gap-2 font-medium px-3 py-2 data-[state=active]:shadow-sm rounded-md transition-colors duration-200"
              >
                <Grid3X3 className="w-4 h-4" />
                Grid View
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce transition-colors duration-200"></div>
              <div
                className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce transition-colors duration-200"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce transition-colors duration-200"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium transition-colors duration-200">
              {inProgressSteps} step in progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
