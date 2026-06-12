import api from './api';
import type { ApiResponse, Category } from '@/types';

export const categoryService = {
  listCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  createCategory: async (data: FormData): Promise<ApiResponse<Category>> => {
    const response = await api.post<ApiResponse<Category>>('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateCategory: async (id: string, data: FormData): Promise<ApiResponse<Category>> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/categories/${id}`);
    return response.data;
  },
};
