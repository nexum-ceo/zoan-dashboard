export type TAgentInformation = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type TUser = {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
  bio?: string;
  location?: string;
  xHandle?: string;
  githubHandle?: string;
  website?: string;
  avatar?: string;
  totalPrompts?: number;
  createdAt: string;
  updatedAt: string;
};
