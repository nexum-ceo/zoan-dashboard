import { Metadata } from 'next';
import { PlaygroundClient } from './components/playground-client';

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXTAUTH_URL + `/playground`;
  return {
    title: 'Playground - Zoan AI',
    description: 'Chat and interact with AI agents in the playground',
    alternates: {
      canonical: url,
    },
  };
}

export default function PlaygroundPage() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <PlaygroundClient />
    </div>
  );
}
