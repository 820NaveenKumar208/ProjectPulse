import { createContext } from 'react';

import type { AuthUser, UserRole } from '../types/auth';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organizationId: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
