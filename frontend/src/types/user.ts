export type UserConnection = {
  provider: string;
  providerUserId: string;
  providerUserName: string;
  providerAccountEmail: string;
  linkedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  private: boolean;
  connections: UserConnection[];
};
