'use client';

import Configuration from '@/app/dashboard/assistant/[id]/components/Configuration';
import Trainning from '@/app/dashboard/assistant/[id]/components/Trainning';
import Workflow from '@/app/dashboard/assistant/[id]/components/Workflow';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  DatabaseZap,
  FileSliders,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AssitantTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'config' | 'training' | 'workflow'>('config');

  // Read tab from URL params
  useEffect(() => {
    const t = searchParams.get('t');
    if (t === 'config' || t === 'training' || t === 'workflow') {
      setTab(t);
    }
  }, [searchParams]);

  // When change tab, update URL param t
  const handleTabChange = (newTab: 'config' | 'training' | 'workflow') => {
    setTab(newTab);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('t', newTab);
    router.replace(`?${params.toString()}`);
  };

  return (
    <Tabs className="m-2 rounded-lg flex-1 flex flex-row gap-3" value={tab}>
      <div className="flex bg-card flex-1 rounded-lg flex-col gap-6 p-2 border border-border shadow-sm">
        {/* <SelectAssistant /> */}
        <Button className="w-full">Chat with</Button>

        <div className="flex flex-col gap-2">
          <div className="text-[12px] text-muted-foreground font-medium">
            Preferences
          </div>
          <Button
            variant="ghost"
            onClick={() => handleTabChange('config')}
            className={cn(
              'flex items-center justify-start gap-2 transition-colors',
              tab === 'config'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50 hover:text-accent-foreground',
            )}
          >
            <FileSliders className="w-4 h-4" /> Configuration
          </Button>
          <div className="text-[12px] text-muted-foreground font-medium">
            Data
          </div>
          <Button
            variant="ghost"
            onClick={() => handleTabChange('training')}
            className={cn(
              'flex items-center justify-start gap-2 transition-colors',
              tab === 'training'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50 hover:text-accent-foreground',
            )}
          >
            <DatabaseZap className="w-4 h-4" /> Training Data
          </Button>
          <div className="text-[12px] text-muted-foreground font-medium">
            Operation
          </div>
          <Button
            variant="ghost"
            onClick={() => handleTabChange('workflow')}
            className={cn(
              'flex items-center justify-start gap-2 transition-colors',
              tab === 'workflow'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50 hover:text-accent-foreground',
            )}
          >
            <WorkflowIcon className="w-4 h-4" /> Workflow
          </Button>
        </div>
      </div>
      <div className="flex bg-card flex-6 rounded-lg flex-col gap-2 border border-border shadow-sm">
        <TabsContent value="config" className="flex-1">
          <Configuration />
        </TabsContent>
        <TabsContent value="training" className="flex-1">
          <Trainning />
        </TabsContent>
        <TabsContent value="workflow" className="flex-1">
          <Workflow />
        </TabsContent>
      </div>
    </Tabs>
  );
}
