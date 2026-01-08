import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthUser, Language } from '@/types/chat';
import { mockLogin, mockRegister, mockForgotPassword } from '@/lib/mockAuth';
import { t } from '@/lib/i18n';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  language: Language;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  const translate = useCallback((key: string) => t(key as any, language), [language]);

  // Check for stored session on mount
  useEffect(() => {
    const stored = localStorage.getItem('chat-user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('chat-user');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await mockLogin(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('chat-user', JSON.stringify(result.user));
      }
      return { success: result.success, error: result.error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await mockRegister(name, email, password);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('chat-user', JSON.stringify(result.user));
      }
      return { success: result.success, error: result.error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const result = await mockForgotPassword(email);
      return { success: result.success, error: result.error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('chat-user');
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    language,
    login,
    register,
    forgotPassword,
    logout,
    setLanguage,
    translate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
