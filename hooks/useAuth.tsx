import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { LoginPayload, RegisterPayload } from '@/types';
import React, { createContext, useCallback, useContext, useEffect } from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useAuthStore.getState>['user'];
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, setUser, setLoading, signOut: clearAuth } = useAuthStore();

  // Revalida o token ao iniciar o app
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await authService.getStoredToken();
        if (token) {
          const me = await authService.getMe();
          setUser(me);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    bootstrap();
  }, [setUser, setLoading]);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const { user: me } = await authService.login(payload);
      setUser(me);
    },
    [setUser],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) => {
      const { user: me } = await authService.register(payload);
      setUser(me);
    },
    [setUser],
  );

  const signOut = useCallback(async () => {
    await authService.logout();
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
