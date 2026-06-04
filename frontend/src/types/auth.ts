export type UserRole = 'admin' | 'manager' | 'client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};
