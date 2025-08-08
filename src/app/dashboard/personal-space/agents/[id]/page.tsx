'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle,
  ChevronDown,
  Code,
  Grid3X3,
  MoreHorizontal,
  Play,
  RotateCcw,
  Settings,
  Workflow,
  Zap,
} from 'lucide-react';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  timeEstimate: string;
  progress?: number;
  icon: React.ReactNode;
  dependsOn?: number;
}

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
];

export default function AgentWorkflow() {
  const completedSteps = workflowSteps.filter(
    (step) => step.status === 'completed',
  ).length;
  const totalSteps = workflowSteps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;
  const inProgressSteps = workflowSteps.filter(
    (step) => step.status === 'in-progress',
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
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
        </Card>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-900"
            >
              <Workflow className="w-4 h-4" />
              Workflow Diagram
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-500"
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

        {/* Workflow Steps */}
        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <Card
                className={`p-6 ${
                  step.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : step.status === 'in-progress'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.status === 'completed'
                          ? 'bg-green-600 text-white'
                          : step.status === 'in-progress'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span className="text-lg font-bold">{step.id}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{step.description}</p>

                      {step.status === 'in-progress' && step.progress && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              Processing...
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              {step.progress}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${step.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
                            <div
                              className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                            <div
                              className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"
                              style={{ animationDelay: '0.4s' }}
                            ></div>
                            <span className="text-xs text-gray-500 ml-1">
                              Estimated 5-10 seconds remaining
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            step.status === 'completed'
                              ? 'default'
                              : step.status === 'in-progress'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={
                            step.status === 'completed'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : step.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }
                        >
                          {step.status === 'completed'
                            ? 'Completed'
                            : step.status === 'in-progress'
                            ? 'In Progress'
                            : 'Pending'}
                        </Badge>
                        {step.dependsOn && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>Depends on:</span>
                            <Badge variant="outline" className="text-xs">
                              #{step.dependsOn}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">
                        {step.timeEstimate}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Connecting Arrow */}
              {index < workflowSteps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
