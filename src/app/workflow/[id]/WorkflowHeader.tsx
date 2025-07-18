import { Button } from '@/components/ui/button';
import React from 'react';

interface WorkflowHeaderProps {
  name?: string;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  name = 'Daniel',
}) => (
  <header className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-zinc-200 z-[1001] flex items-center justify-between px-4">
    {/* Left side */}
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        title="Go back"
        className="text-zinc-500"
      >
        ←
      </Button>
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-zinc-900">{name}</span>
        <Button
          variant="ghost"
          size="icon"
          title="Edit name"
          className="text-zinc-500"
        >
          ✏️
        </Button>
      </div>
      <span className="px-2 py-1 rounded-xl bg-green-100 text-green-800 text-xs font-medium">
        Published
      </span>
    </div>

    {/* Right side */}
    <div className="flex items-center gap-3">
      <Button variant="ghost" className="text-zinc-500 px-3">
        🕒 Version history
      </Button>
      <Button variant="outline" className="font-medium">
        Save changes
      </Button>
      <Button variant="destructive" className="font-medium">
        Unpublished
      </Button>
      <Button variant="outline" className="font-medium flex items-center gap-1">
        👁️ Preview
      </Button>
    </div>
  </header>
);
