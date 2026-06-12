import api, { setAccessToken } from './api';
import type { ApiResponse, LoginResponse, LoginBody, RegisterBody } from '@/types';

export const authService = {
  register: async (data: RegisterBody): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse<null>> => {
    const response = await api.get<ApiResponse<null>>(`/auth/verify-email/${token}`);
    return response.data;
  },

  login: async (data: LoginBody): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    if (response.data.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }
    return response.data;
  },

  refresh: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    if (response.data.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    setAccessToken(null);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
};
