export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  private: boolean;
};
