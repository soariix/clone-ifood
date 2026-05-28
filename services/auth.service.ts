import { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types';
import * as SecureStore from 'expo-secure-store';
import api from './api';

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> {
    const { data } = await api.post<{ user: User; tokens: AuthTokens }>('/auth/login', payload);
    await SecureStore.setItemAsync('accessToken', data.tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.tokens.refreshToken);
    return data;
  },

  async register(payload: RegisterPayload): Promise<{ user: User; tokens: AuthTokens }> {
    const { data } = await api.post<{ user: User; tokens: AuthTokens }>('/auth/register', payload);
    await SecureStore.setItemAsync('accessToken', data.tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.tokens.refreshToken);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync('accessToken');
  },
};
