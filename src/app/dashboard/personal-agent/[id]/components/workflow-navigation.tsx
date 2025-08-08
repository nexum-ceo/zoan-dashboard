'use client';

import { Button } from '@/components/ui/button';
import { Grid3X3, Workflow } from 'lucide-react';

interface WorkflowNavigationProps {
  inProgressSteps: number;
}

export function WorkflowNavigation({
  inProgressSteps,
}: WorkflowNavigationProps) {
  return (
    <div className="bg-gray-50 px-20 py-4 flex-shrink-0">
      <div className="mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-900 font-medium px-3 py-2"
            >
              <Workflow className="w-4 h-4" />
              Workflow Diagram
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-500 px-3 py-2"
            >
              <Grid3X3 className="w-4 h-4" />
              Grid View
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-sm text-blue-600 font-medium">
              {inProgressSteps} step in progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
