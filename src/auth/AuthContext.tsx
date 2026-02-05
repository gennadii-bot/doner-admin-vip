import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adminLogin, clearStoredToken, decodeToken, getStoredToken, isTokenValidAdmin, setStoredToken } from '../api/api';
import { AuthState } from '../types';

type AuthContextValue = {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrapAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    email: null,
    role: null,
    loading: true,
  });

  const logout = useCallback(async () => {
    await clearStoredToken();
    setAuthState({ token: null, email: null, role: null, loading: false });
  }, []);

  const bootstrapAuth = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    const token = await getStoredToken();

    if (!token || !isTokenValidAdmin(token)) {
      await logout();
      return;
    }

    const payload = decodeToken(token);
    setAuthState({
      token,
      email: payload.sub,
      role: payload.role,
      loading: false,
    });
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const token = await adminLogin(email, password);
    if (!isTokenValidAdmin(token)) {
      throw new Error('Пользователь не является администратором или токен невалиден');
    }

    await setStoredToken(token);
    const payload = decodeToken(token);

    setAuthState({
      token,
      email: payload.sub,
      role: payload.role,
      loading: false,
    });
  }, []);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const value = useMemo(
    () => ({
      authState,
      login,
      logout,
      bootstrapAuth,
    }),
    [authState, bootstrapAuth, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
