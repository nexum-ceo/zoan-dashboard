import chatApiRequest from '@/api-requests/chat';
import { PlaygroundChatClient } from '@/app/dashboard/playground/components/playground-chat-client';
import { wrapServerApi } from '@/lib/utils';
import { baseOpenGraph } from '@/shared-metadata';
import { Metadata } from 'next';
import { cache } from 'react';
const getChat = cache((id: string) =>
  wrapServerApi(() => chatApiRequest.getChat(id)),
);

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const data = await getChat(id);
  const chat = data?.data.data;
  const url = `${process.env.NEXTAUTH_URL}/dashboard/playground/${id}`;
  return {
    title: `${chat?.title}`,
    description: 'Continue your conversation with your selected AI assistant',
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...baseOpenGraph,
      url,
      title: `${chat?.title}`,
      description: 'Continue your conversation with your selected AI assistant',
    },
  };
}

export default async function PlaygroundChatPage(props: PageProps) {
  const { id } = await props.params;
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <PlaygroundChatClient chatId={id} />
    </div>
  );
}
