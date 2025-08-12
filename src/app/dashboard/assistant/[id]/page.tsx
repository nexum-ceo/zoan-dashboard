import agentApiRequest from '@/api-requests/agent';
import AssitantTabs from '@/app/dashboard/assistant/[id]/components/assitant-tabs';
import { wrapServerApi } from '@/lib/utils';
import { baseOpenGraph } from '@/shared-metadata';
import { Metadata } from 'next';
import { cache } from 'react';

const getAssistant = cache((id: string) =>
  wrapServerApi(() => agentApiRequest.getAgent(id)),
);

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const data = await getAssistant(id);
  const agent = data?.data;
  const url = `${process.env.NEXTAUTH_URL}/dashboard/assistant/${id}`;
  return {
    title: `${agent?.name}`,
    description:
      agent?.description ||
      'Continue your conversation with your selected AI assistant',
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...baseOpenGraph,
      url,
      title: `${agent?.name}`,
      description:
        agent?.description ||
        'Continue your conversation with your selected AI assistant',
    },
  };
}

export default async function AssistantPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <AssitantTabs />
    </div>
  );
}
