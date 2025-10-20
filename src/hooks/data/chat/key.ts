export const CHAT_KEYS = {
  chatList: ['chat-list'] as const,
  chatListInfinite: ['chat-list-infinite'] as const,

  // Single chat queries
  chat: (id: string) => ['chat', id] as const,
  chatMessagesInfinite: (id: string) => ['chat-messages-infinite', id] as const,
  primaryAgentByChatId: (id: string) =>
    ['primary-agent-by-chat-id', id] as const,
  chatAgentSettingByChatId: (id: string) =>
    ['chat-agent-setting-by-chat-id', id] as const,
  chatGameVersionList: (id: string) => ['chat-game-version-list', id] as const,
} as const;
