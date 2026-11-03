import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, SchoolSettings } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  settings: SchoolSettings | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchUser: (role: UserRole) => Promise<void>;
  refreshSettings: () => Promise<void>;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sisarpras_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session & settings on mount
  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
        }
        const setRes = await api.getSettings();
        if (setRes.settings) {
          setSettings(setRes.settings);
        }
      } catch (err) {
        console.error('Failed to initialize session or settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const refreshSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('Failed to reload settings:', err);
    }
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const switchUser = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const usersRes = await api.getQuickUsers();
      const target = usersRes.users.find(u => u.role === targetRole && u.status === 'AKTIF');
      if (target) {
        setUser(target);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(target));
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrentUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        settings,
        isLoading,
        login,
        logout,
        switchUser,
        refreshSettings,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
