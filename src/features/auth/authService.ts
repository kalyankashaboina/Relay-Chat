import { api } from '@/shared/api/client';
import type { AuthUser } from '@/features/chat/types';

interface ApiUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  isEmailVerified?: boolean;
  provider?: string;
}

interface AuthApiResponse {
  success: boolean;
  data: ApiUser;
}

function toAuthUser(u: ApiUser): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatar: u.avatar ?? '',
  };
}

function extractErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message ?? e?.message ?? 'Something went wrong';
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser | null> {
    const res = await api.post<AuthApiResponse>('/auth/login', { email, password });
    return toAuthUser(res.data);
  },

  async register(username: string, email: string, password: string): Promise<AuthUser | null> {
    const res = await api.post<AuthApiResponse>('/auth/register', { username, email, password });
    return toAuthUser(res.data);
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Server-side session already invalid — ignore
    }
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const res = await api.get<AuthApiResponse>('/auth/me');
      return toAuthUser(res.data);
    } catch {
      return null;
    }
  },

  extractErrorMessage,
};
