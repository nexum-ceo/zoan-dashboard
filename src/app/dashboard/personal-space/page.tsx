'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  MoreHorizontal,
  Play,
  RotateCcw,
  Settings,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  duration: string;
  progress?: number;
  estimatedTime?: string;
  dependsOn?: number;
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    title: 'Requirement Analysis',
    description: 'Analyze coding requirements and technical specifications',
    status: 'completed',
    duration: '1-3 seconds',
  },
  {
    id: 2,
    title: 'Architecture Design',
    description: 'Design application architecture and component structure',
    status: 'in-progress',
    duration: '5-10 seconds',
    progress: 40,
    estimatedTime: 'Estimated 5-10 seconds remaining',
    dependsOn: 1,
  },
  {
    id: 3,
    title: 'Code Generation',
    description: 'Generate clean, efficient, and well-documented code',
    status: 'pending',
    duration: '10-30 seconds',
  },
];

export default function PersonalSpace() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'grid'>('workflow');

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-600 hover:bg-gray-100"
          >
            Processing...
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getStepCardStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Code Assistant Pro
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Advanced coding assistant for React and Next.js development
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
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

            {/* Progress Section */}
            <div className="mt-6 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Development
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  1 of 5 steps completed
                </span>
                <Progress value={20} className="w-32" />
                <span className="text-sm font-semibold text-blue-600">20%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'workflow'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm opacity-60"></div>
                <div className="bg-current rounded-sm opacity-40"></div>
                <div className="bg-current rounded-sm opacity-40"></div>
                <div className="bg-current rounded-sm opacity-60"></div>
              </div>
              <span>Workflow Diagram</span>
            </button>
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-current rounded-sm opacity-60"
                  ></div>
                ))}
              </div>
              <span>Grid View</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-sm text-blue-600 font-medium">
              1 step in progress
            </span>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <Card
                className={`${getStepCardStyle(
                  step.status,
                )} transition-all duration-200`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                          step.status === 'completed'
                            ? 'bg-green-500'
                            : step.status === 'in-progress'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}
                      >
                        {step.id}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {step.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{step.description}</p>

                        {step.status === 'in-progress' && step.progress && (
                          <div className="space-y-2">
                            <Progress
                              value={step.progress}
                              className="w-full"
                            />
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-600 font-medium">
                                {step.progress}%
                              </span>
                              <span className="text-gray-500">
                                {step.estimatedTime}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-3 mt-3">
                          {getStepBadge(step.status)}
                          {step.dependsOn && (
                            <span className="text-xs text-gray-500">
                              Depends on: #{step.dependsOn}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {step.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Arrow connector */}
              {index < workflowSteps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
