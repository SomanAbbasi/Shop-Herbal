import api from './api';
import type { ApiResponse, User, PaginatedResponse, UpdateProfileBody, Address, AddAddressBody } from '@/types';

export const userService = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileBody): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    return response.data;
  },

  listUsers: async (page = 1, limit = 10, status?: string): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    const response = await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
    return response.data;
  },

  approveUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/approve`);
    return response.data;
  },

  suspendUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/suspend`);
    return response.data;
  },

  getAddresses: async (): Promise<ApiResponse<Address[]>> => {
    const response = await api.get<ApiResponse<Address[]>>('/users/addresses');
    return response.data;
  },

  addAddress: async (data: AddAddressBody): Promise<ApiResponse<Address[]>> => {
    const response = await api.post<ApiResponse<Address[]>>('/users/addresses', data);
    return response.data;
  },

  updateAddress: async (id: string, data: AddAddressBody): Promise<ApiResponse<Address[]>> => {
    const response = await api.put<ApiResponse<Address[]>>(`/users/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: string): Promise<ApiResponse<Address[]>> => {
    const response = await api.delete<ApiResponse<Address[]>>(`/users/addresses/${id}`);
    return response.data;
  },
};
