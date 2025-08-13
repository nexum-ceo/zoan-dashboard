'use client';

import { CheckCircle, Code, FileText, TestTube, Zap } from 'lucide-react';
import { useState } from 'react';
import { WorkflowGridView } from './components/workflow-grid-view';
import { WorkflowHeader } from './components/workflow-header';
import { WorkflowNavigation } from './components/workflow-navigation';
import { WorkflowProgress } from './components/workflow-progress';
import {
  WorkflowStepCard,
  type WorkflowStep,
} from './components/workflow-step-card';

const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    title: 'Requirement Analysis',
    description: 'Analyze coding requirements and technical specifications',
    status: 'completed',
    timeEstimate: '1-3 seconds',
    icon: <CheckCircle className="w-6 h-6" />,
  },
  {
    id: 2,
    title: 'Architecture Design',
    description: 'Design application architecture and component structure',
    status: 'in-progress',
    timeEstimate: '5-10 seconds',
    progress: 40,
    icon: <Zap className="w-6 h-6" />,
    dependsOn: 1,
  },
  {
    id: 3,
    title: 'Code Generation',
    description: 'Generate clean, efficient, and well-documented code',
    status: 'pending',
    timeEstimate: '10-30 seconds',
    icon: <Code className="w-6 h-6" />,
    dependsOn: 2,
  },
  {
    id: 4,
    title: 'Testing Setup',
    description: 'Create comprehensive tests and quality assurance',
    status: 'pending',
    timeEstimate: '5-15 seconds',
    icon: <TestTube className="w-6 h-6" />,
    dependsOn: 3,
  },
  {
    id: 5,
    title: 'Documentation',
    description: 'Generate comprehensive documentation and usage examples',
    status: 'pending',
    timeEstimate: '3-8 seconds',
    icon: <FileText className="w-6 h-6" />,
    dependsOn: 4,
  },
];

export default function AgentWorkflow() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'grid'>('workflow');

  const completedSteps = workflowSteps.filter(
    (step) => step.status === 'completed',
  ).length;
  const totalSteps = workflowSteps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;
  const inProgressSteps = workflowSteps.filter(
    (step) => step.status === 'in-progress',
  ).length;

  return (
    <div className="h-screen bg-background flex flex-col transition-colors duration-200">
      <WorkflowHeader
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        overallProgress={overallProgress}
      />

      <WorkflowNavigation
        inProgressSteps={inProgressSteps}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-background transition-colors duration-200">
        <div className="px-20 py-6">
          <div className="mx-auto">
            {activeTab === 'workflow' ? (
              <div className="space-y-4">
                {workflowSteps.map((step, index) => (
                  <WorkflowStepCard
                    key={step.id}
                    step={step}
                    isLast={index === workflowSteps.length - 1}
                    index={index}
                  />
                ))}

                <WorkflowProgress
                  completedSteps={completedSteps}
                  totalSteps={totalSteps}
                  overallProgress={overallProgress}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <WorkflowGridView steps={workflowSteps} />

                <WorkflowProgress
                  completedSteps={completedSteps}
                  totalSteps={totalSteps}
                  overallProgress={overallProgress}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
