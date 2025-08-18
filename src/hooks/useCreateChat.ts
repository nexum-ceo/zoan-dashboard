import { CreateChatBodyType, CreateChatResType } from '@/types/chat';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useCreateChat() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createChat = async (body: CreateChatBodyType) => {
    setLoading(true);
    try {
      const res = await axios.post<CreateChatResType>('/api/chat', body);
      const chatId = res.data.data.id;
      router.push(`/dashboard/playground/${chatId}`);
      return chatId;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { createChat, loading };
}
