import { Metadata } from 'next';
import { PlaygroundClient } from './components/playground-client';

export const metadata: Metadata = {
  title: 'Playground - Zoan Dashboard',
  description: 'Chat and interact with AI agents in the playground',
};

export default function PlaygroundPage() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <PlaygroundClient />
    </div>
  );
}
