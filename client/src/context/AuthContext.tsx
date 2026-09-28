import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api';
import { TOKEN_KEY } from '../api/client';
import type { User } from '../lib/types';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Only need to "initialize" if there is a stored token to validate
  const [initializing, setInitializing] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // On first load, restore the session from a stored token (validated by the server)
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authApi
      .me()
      .then(setUser)
      .catch(clearSession)
      .finally(() => setInitializing(false));
  }, [clearSession]);

  // Any 401 from the API (e.g. token expired) logs the user out
  useEffect(() => {
    window.addEventListener('auth:unauthorized', clearSession);
    return () => window.removeEventListener('auth:unauthorized', clearSession);
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      setUser,
      async login(email, password) {
        const { token, user } = await authApi.login({ email, password });
        localStorage.setItem(TOKEN_KEY, token);
        setUser(user);
        return user;
      },
      async register(name, email, password) {
        const { token, user } = await authApi.register({ name, email, password });
        localStorage.setItem(TOKEN_KEY, token);
        setUser(user);
        return user;
      },
      async logout() {
        await authApi.logout().catch(() => undefined); // best effort — token is discarded either way
        clearSession();
      },
    }),
    [user, initializing, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
