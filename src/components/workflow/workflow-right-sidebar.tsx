'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TabType } from '@/types/workflow';
import { Node } from '@xyflow/react';
import {
  Bold,
  Italic,
  Link,
  Plus,
  Strikethrough,
  Underline,
  X,
} from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

type RightSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedNode?: Node;
};

export const WorkflowRightSideBar: FC<RightSidebarProps> = ({
  isOpen,
  onClose,
  selectedNode,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('Setting');
  const [message, setMessage] = useState<string>(
    '👋 Hello! How can I help you today?',
  );
  const [selectionRequired, setSelectionRequired] = useState<boolean>(false);
  const [timeoutEnabled, setTimeoutEnabled] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-16 w-80 h-[calc(100vh-4rem)] bg-white border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs">💬</span>
          </div>
          <h2 className="font-medium text-gray-900">Message with actions</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['Setting', 'Introduction'].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab as TabType)}
            className={`px-4 py-3 text-sm font-medium border-b-2 rounded-none shadow-none transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'Setting' && (
          <>
            {/* Message Section */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Message <span className="text-red-500">*</span>
              </label>

              {/* Text Formatting Toolbar */}
              <div className="flex items-center gap-1 p-2 border border-gray-200 rounded-t-md bg-gray-50">
                <Button variant="ghost" size="icon" className="p-1 h-7 w-7">
                  <Bold size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="p-1 h-7 w-7">
                  <Italic size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="p-1 h-7 w-7">
                  <Underline size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="p-1 h-7 w-7">
                  <Strikethrough size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="p-1 h-7 w-7">
                  <Link size={14} />
                </Button>
              </div>

              {/* Text Input */}
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-t-0 rounded-b-md resize-none"
                rows={3}
                placeholder="Enter your message..."
              />
            </div>

            {/* Selection Required Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Selection required before continuing
              </span>
              <Switch
                checked={selectionRequired}
                onCheckedChange={setSelectionRequired}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Action Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">
                  Action (0/5)
                </span>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 px-2 py-1"
                >
                  <Plus size={14} />
                  Add action
                </Button>
              </div>
            </div>

            {/* Timeout Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Timeout
                </span>
                <Switch
                  checked={timeoutEnabled}
                  onCheckedChange={setTimeoutEnabled}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              <p className="text-xs text-gray-500">
                Establishing timeout for the customer's response
              </p>
            </div>
          </>
        )}

        {activeTab === 'Introduction' && (
          <div className="text-sm text-gray-600">
            <p>Introduction content would go here...</p>
          </div>
        )}
      </div>
    </aside>
  );
};
