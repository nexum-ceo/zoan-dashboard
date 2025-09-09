import {
  ChatMessageType,
  ChatRole,
  GetSpecificChatResType,
} from '@/types/chat';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  sender_id: string | null;
  parts?: Array<{ type: string; text?: string }>;
};

/**
 * Transform API chat messages to safe format for UI
 */
export const transformChatMessages = (
  chatMessages: ChatMessageType[] | null | undefined,
  userId: string,
): ChatMessage[] => {
  if (!Array.isArray(chatMessages) || chatMessages.length === 0) {
    return [];
  }

  const safeMessages = chatMessages.map((msg) => ({
    ...msg,
    content: msg.content ?? '',
    role: Object.values(ChatRole).includes(msg.role) ? msg.role : ChatRole.USER,
    sender_id: userId || '',
  }));

  return [...safeMessages].reverse();
};

/**
 * Check if messages should be synced from API
 */
export const shouldSyncMessagesFromAPI = (
  chatInfo: GetSpecificChatResType['data'] | undefined,
  chatMessages: ChatMessageType[] | null | undefined,
  currentMessages: ChatMessage[],
): boolean => {
  return !!(
    chatInfo?.user_id &&
    Array.isArray(chatMessages) &&
    currentMessages.length === 0
  );
};

/**
 * Fetch auth token from session
 */
export const fetchAuthToken = async (): Promise<string> => {
  try {
    const response = await fetch('/api/auth/session');
    const data = await response.json();
    return data.accessToken || '';
  } catch (error) {
    console.error('Failed to fetch auth token:', error);
    return '';
  }
};

/**
 * Handle pending message from localStorage
 */
export const getPendingMessage = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('pendingMessage') || '';
};

/**
 * Clear pending message from localStorage
 */
export const clearPendingMessage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pendingMessage');
  }
};
