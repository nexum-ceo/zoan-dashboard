export const USER_KEYS = {
  currentUserProfile: ['current-user-profile'] as const,
  checkUsernameExists: (username: string) =>
    ['is-existing-username', username] as const,
} as const;
