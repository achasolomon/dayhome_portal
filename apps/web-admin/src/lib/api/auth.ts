import apiClient from './client';
import { useAuthStore } from '@/lib/stores/auth.store';

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    const { accessToken, user } = data;
    useAuthStore.getState().setTokens(accessToken, user);
    return data;
  },

  register: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    useAuthStore.getState().clearAuth();
  },

  refresh: async () => {
    const { data } = await apiClient.post('/auth/refresh');
    const { accessToken, user } = data;
    useAuthStore.getState().setTokens(accessToken, user);
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await apiClient.post('/auth/reset-password', { token, password });
    return data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const { data } = await apiClient.post('/auth/change-password', { oldPassword, newPassword });
    return data;
  },
};
