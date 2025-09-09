'use client';
import { PlaygroundInput } from '@/app/dashboard/playground/components';

export default function HomePage() {
  return (
    <div className="my-container">
      <div className="text-body-b1 text-center">
        What should we build today?
      </div>

      {/* Input Area */}
      <PlaygroundInput value={''} disabled={false} />
    </div>
  );
}
