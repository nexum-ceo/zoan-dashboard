'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Settings, Sparkles, Users, X, Zap } from 'lucide-react';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSettings({ isOpen, onClose }: ChatSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Chat Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Primary Agent Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <h3 className="font-medium">Primary Agent</h3>
          </div>
          <p className="text-sm text-gray-600">
            The main agent that handles general queries and coordinates with
            specialized agents.
          </p>
          <Select defaultValue="general-assistant">
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general-assistant">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">General Assistant</div>
                    <div className="text-xs text-gray-500">General</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Primary Prompt Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-medium">Primary Prompt</h3>
          </div>
          <p className="text-sm text-gray-600">
            Set the context and behavior for your chat session.
          </p>
          <Textarea
            placeholder="You are a helpful assistant that specializes in..."
            className="min-h-[100px] resize-none"
            defaultValue="You are a helpful assistant that specializes in..."
          />
        </div>

        {/* Intent Detection Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <h3 className="font-medium">Intent Detection</h3>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800">Active</span>
            </div>
            <p className="text-sm text-green-700">
              AI will automatically detect your intent and route to the
              appropriate agent.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Active Agents:</strong> 4 of 5
          </p>
        </div>

        {/* Available Agents Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <h3 className="font-medium">Available Agents</h3>
          </div>
          <p className="text-sm text-gray-600">
            Enable agents that can respond to specific intents in your
            conversation.
          </p>

          {/* Agent Item */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-medium">General Assistant</div>
                  <Badge variant="secondary" className="text-xs">
                    Primary
                  </Badge>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="text-sm text-gray-600">
              <div className="mb-2">General</div>
              <p>
                Primary AI assistant that handles general queries and
                coordinates with other agents
              </p>
              <div className="mt-2">
                <p className="font-medium mb-1">Trigger Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    general
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    help
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    explain
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    what
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    +2 more
                  </Badge>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge className="text-xs">General Knowledge</Badge>
                <Badge className="text-xs">Task Coordination</Badge>
                <Badge variant="outline" className="text-xs">
                  +1 more
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
