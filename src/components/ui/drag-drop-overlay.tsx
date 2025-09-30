'use client';

import { useDragDrop } from '@/contexts/DragDropContext';
import { cn } from '@/lib/utils';
import { Code, FileText, Image } from 'lucide-react';
import { useEffect, useState } from 'react';

export const DragDropOverlay = () => {
  const { isDragActive } = useDragDrop();
  const [showAnimation, setShowAnimation] = useState<boolean>(false);

  useEffect(() => {
    if (isDragActive) {
      setShowAnimation(true);
    } else {
      setShowAnimation(false);
    }
  }, [isDragActive]);

  if (!isDragActive) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-all duration-300',
        showAnimation ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'bg-white rounded-2xl p-8 shadow-2xl border border-dashed border-primary-brand-darker-green transition-all duration-300 transform',
            showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
        >
          {/* Simple file icons */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-pink-600" />
            </div>
          </div>

          {/* Main message */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop files here
            </h3>
            <p className="text-gray-600">
              Drag and drop any file to add to the conversation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
