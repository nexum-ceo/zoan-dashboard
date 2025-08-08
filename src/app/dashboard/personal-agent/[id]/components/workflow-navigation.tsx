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
    <div className="bg-gray-50 px-20 py-4 flex-shrink-0">
      <div className="mx-auto">
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              onTabChange?.(value as 'workflow' | 'grid')
            }
            className="w-fit"
          >
            <TabsList className="bg-white border border-gray-200 p-1 h-auto rounded-lg shadow-sm">
              <TabsTrigger
                value="workflow"
                className="flex items-center gap-2 text-gray-700 font-medium px-3 py-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md"
              >
                <Workflow className="w-4 h-4" />
                Workflow Diagram
              </TabsTrigger>
              <TabsTrigger
                value="grid"
                className="flex items-center gap-2 text-gray-700 font-medium px-3 py-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md"
              >
                <Grid3X3 className="w-4 h-4" />
                Grid View
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <span className="text-sm text-blue-600 font-medium">
              {inProgressSteps} step in progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
