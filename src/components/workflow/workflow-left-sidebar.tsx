'use client';

import {
  Ban,
  Bell,
  FileText,
  MousePointer,
  Percent,
  Plus,
  Square,
  Type,
  X,
} from 'lucide-react';
import { ReactNode } from 'react';

interface SidebarItemProps {
  icon: ReactNode;
  title?: string;
  onClick?: () => void;
}

const SidebarItem = ({ icon, title, onClick }: SidebarItemProps) => (
  <button
    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 hover:text-gray-900"
    title={title}
    onClick={onClick}
  >
    {icon}
  </button>
);

const SidebarSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="mb-8">
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </div>
);

export function WorkflowLeftSideBar({
  onAddNode,
}: {
  onAddNode: (type: string) => void;
}) {
  return (
    <aside className="fixed left-0 top-16 w-20 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-50 flex flex-col">
      {/* Blue accent line */}
      <div className="absolute left-0 top-0 w-1 h-full bg-blue-500" />

      <div className="flex-1 p-3 pt-6">
        <SidebarSection title="BUTTON">
          <SidebarItem
            icon={<Type size={18} />}
            title="Text Button"
            onClick={() => onAddNode('text')}
          />
          <SidebarItem
            icon={<MousePointer size={18} />}
            title="Click Button"
            onClick={() => onAddNode('click')}
          />
        </SidebarSection>

        <SidebarSection title="FLOW">
          <SidebarItem
            icon={<Percent size={18} />}
            title="Percentage"
            onClick={() => onAddNode('percentage')}
          />
          <SidebarItem
            icon={
              <Square size={18} className="fill-orange-500 text-orange-500" />
            }
            title="Block"
            onClick={() => onAddNode('block')}
          />
          <SidebarItem
            icon={<Bell size={18} />}
            title="Notification"
            onClick={() => onAddNode('notification')}
          />
          <SidebarItem
            icon={<FileText size={18} />}
            title="Document"
            onClick={() => onAddNode('document')}
          />
          <SidebarItem
            icon={<Ban size={18} className="text-red-500" />}
            title="Stop"
            onClick={() => onAddNode('stop')}
          />
          <SidebarItem
            icon={<X size={18} />}
            title="Close"
            onClick={() => onAddNode('close')}
          />
        </SidebarSection>
      </div>

      {/* Add button at bottom */}
      <div className="p-3 border-t border-gray-200">
        <SidebarItem
          icon={<Plus size={18} className="text-green-600" />}
          title="Add Component"
          onClick={() => onAddNode('new')}
        />
      </div>
    </aside>
  );
}
