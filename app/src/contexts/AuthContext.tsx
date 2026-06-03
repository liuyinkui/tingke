import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getStoredUser, setStoredUser, removeToken, StoredUser } from '../services/storage';
import * as authService from '../services/auth';

interface AuthContextType {
  user: StoredUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (nickname: string) => Promise<void>;
  login: (nickname: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    (async () => {
      const stored = await getStoredUser();
      if (stored) {
        setUser(stored);
      }
      setIsLoading(false);
    })();
  }, []);

  const register = useCallback(async (nickname: string) => {
    const result = await authService.register(nickname);
    setUser(result.user);
  }, []);

  const login = useCallback(async (nickname: string) => {
    const result = await authService.login(nickname);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
