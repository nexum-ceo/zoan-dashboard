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
  reasoning?: Record<string, unknown>;
};

/**
 * Transform API chat messages to safe format for UI
 */
export const transformChatMessages = (
  chatMessages:
    | ChatMessageType[]
    | Array<ChatMessageType | null | undefined>
    | null
    | undefined,
  userId: string,
): ChatMessage[] => {
  if (!Array.isArray(chatMessages) || chatMessages.length === 0) {
    return [];
  }

  const validMessages: ChatMessageType[] = (
    chatMessages as Array<ChatMessageType | null | undefined>
  ).filter((m): m is ChatMessageType => m != null);

  const safeMessages = validMessages.map(
    (msg: ChatMessageType & { reasoning?: Record<string, unknown> }) => ({
      ...msg,
      id: msg.id ?? `${Date.now()}-${Math.random()}`,
      content: msg.content ?? '',
      role: Object.values(ChatRole).includes(msg.role)
        ? msg.role
        : ChatRole.USER,
      sender_id: userId || '',
      reasoning: msg.reasoning ?? undefined,
    }),
  );

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

/**
 * Handle pending attachments from localStorage
 */
// Pending attachments metadata saved in localStorage.
// Store only serializable fields plus a stable id that maps to IndexedDB blob.
export const getPendingAttachments = (): Array<{
  id: string; // maps to IndexedDB key
  file_name: string;
  mime_type: string;
  file_size: number;
}> => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('pendingAttachments');
    const parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.error('Failed to parse pending attachments:', error);
    return [];
  }
};

/**
 * Save pending attachments to localStorage
 */
export const setPendingAttachments = (
  attachments: Array<{
    id: string;
    file_name: string;
    mime_type: string;
    file_size: number;
  }>,
): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pendingAttachments', JSON.stringify(attachments));
  }
};

/**
 * Clear pending attachments from localStorage
 */
export const clearPendingAttachments = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pendingAttachments');
  }
};
