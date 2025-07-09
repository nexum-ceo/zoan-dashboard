'use client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { AGENT_LIST } from '@/const/agent';
import { cn } from '@/lib/utils';
import {
  Bot,
  DatabaseZap,
  FileSliders,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { use, useState } from 'react';
import Configuration from './components/Configuration';
import Trainning from './components/Trainning';
import Workflow from './components/Workflow';

export default function AssistantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [tab, setTab] = useState<'config' | 'training' | 'workflow'>('config');

  const { id } = use(params);

  const agent = AGENT_LIST.find((agent) => agent.id === id);

  return (
    <div className="w-full h-full bg-sidebar rounded-lg border border-border flex flex-col">
      <div className="p-4 text-2xl font-semibold border-b border-border bg-white rounded-t-lg w-full">
        {agent?.name}
      </div>

      <Tabs className="m-2 rounded-lg flex-1 flex flex-row gap-3" value={tab}>
        <div className="flex bg-white flex-1 rounded-lg flex-col gap-6 p-2 border border-border">
          {/* <SelectAssistant /> */}
          <Button className="w-full">
            Chat with {agent?.name} <Bot />
          </Button>

          <div className="flex flex-col gap-2">
            <div className="text-[12px] text-gray-500 font-medium">
              Preferences
            </div>
            <Button
              variant="ghost"
              onClick={() => setTab('config')}
              className={cn(
                'flex items-center justify-start gap-2',
                tab === 'config' && 'bg-black/10 text-foreground',
              )}
            >
              <FileSliders className="w-4 h-4" /> Configuration
            </Button>
            <div className="text-[12px] text-gray-500 font-medium">Data</div>
            <Button
              variant="ghost"
              onClick={() => setTab('training')}
              className={cn(
                'flex items-center justify-start gap-2',
                tab === 'training' && 'bg-black/10 text-foreground',
              )}
            >
              <DatabaseZap className="w-4 h-4" /> Training Data
            </Button>
            <div className="text-[12px] text-gray-500 font-medium">
              Operation
            </div>
            <Button
              variant="ghost"
              onClick={() => setTab('workflow')}
              className={cn(
                'flex items-center justify-start gap-2',
                tab === 'workflow' && 'bg-black/10 text-foreground',
              )}
            >
              <WorkflowIcon /> Workflow
            </Button>
          </div>
        </div>
        <div className="flex bg-white flex-6 rounded-lg flex-col gap-2">
          <TabsContent value="config">
            <Configuration />
          </TabsContent>
          <TabsContent value="training">
            <Trainning />
          </TabsContent>
          <TabsContent value="workflow">
            <Workflow />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
