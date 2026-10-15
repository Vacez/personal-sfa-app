import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/sfaService';
import { AppMode, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentMode: AppMode;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name?: string; default_mode: AppMode }) => Promise<void>;
  logout: () => Promise<void>;
  toggleMode: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentMode, setCurrentMode] = useState<AppMode>('VIP_HOSPITALITY');

  // Try auto-login with default seeded demo credentials for seamless dev test
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authService.login('user@example.com', 'password123');
        setUser(res.user);
        setToken(res.token);
        setCurrentMode(res.user.default_mode || 'VIP_HOSPITALITY');
      } catch (err) {
        console.log('[AuthContext] Auto-login failed, user should login manually:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken(res.token);
      setCurrentMode(res.user.default_mode || 'VIP_HOSPITALITY');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; name?: string; default_mode: AppMode }) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      setToken(res.token);
      setCurrentMode(res.user.default_mode || 'VIP_HOSPITALITY');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const toggleMode = async () => {
    const newMode: AppMode = currentMode === 'VIP_HOSPITALITY' ? 'B2B_CONSULTING' : 'VIP_HOSPITALITY';
    try {
      await authService.updateMode(newMode);
      setCurrentMode(newMode);
      if (user) {
        setUser({ ...user, default_mode: newMode });
      }
    } catch (err) {
      console.warn('Failed to update mode on server, switching locally:', err);
      setCurrentMode(newMode);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getMe();
      setUser(profile);
      setCurrentMode(profile.default_mode);
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        currentMode,
        login,
        register,
        logout,
        toggleMode,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
