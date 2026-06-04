import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { apiRequest } from './api';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { clearStoredSession, readStoredSession, writeStoredSession } from './authStorage';
import type { AuthSession, AuthUser, UserRole } from '../types/auth';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [isHydrating, setIsHydrating] = useState(true);

  const persistSession = useCallback((nextSession: AuthSession) => {
    setSession(nextSession);
    writeStoredSession(nextSession);
  }, []);

  const refreshSession = useCallback(
    async (refreshToken: string) => {
      const nextSession = await apiRequest<AuthSession>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      persistSession(nextSession);
      return nextSession;
    },
    [persistSession],
  );

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      const storedSession = readStoredSession();

      if (!storedSession) {
        if (isMounted) {
          setIsHydrating(false);
        }
        return;
      }

      try {
        const userResponse = await apiRequest<{ user: AuthUser }>('/auth/me', {
          accessToken: storedSession.accessToken,
        });

        if (isMounted) {
          const nextSession = {
            ...storedSession,
            user: userResponse.user,
          };
          setSession(nextSession);
          writeStoredSession(nextSession);
        }
      } catch {
        try {
          await refreshSession(storedSession.refreshToken);
        } catch {
          clearStoredSession();
          if (isMounted) {
            setSession(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    }

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [refreshSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const nextSession = await apiRequest<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      persistSession(nextSession);
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const nextSession = await apiRequest<AuthSession>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      persistSession(nextSession);
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    const activeSession = session;
    setSession(null);
    clearStoredSession();

    if (activeSession?.refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: activeSession.refreshToken }),
      }).catch(() => undefined);
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isHydrating,
      login,
      register,
      logout,
    }),
    [isHydrating, login, logout, register, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
