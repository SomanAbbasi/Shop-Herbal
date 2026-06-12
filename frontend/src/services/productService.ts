import api from './api';
import type { ApiResponse, Product, PaginatedResponse, Review, CreateReviewBody } from '@/types';

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}

export const productService = {
  listProducts: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    const response = await api.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    return response.data;
  },

  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: FormData): Promise<ApiResponse<Product>> => {
    const response = await api.post<ApiResponse<Product>>('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProduct: async (id: string, data: FormData): Promise<ApiResponse<Product>> => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/products/${id}`);
    return response.data;
  },

  activateProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/activate`);
    return response.data;
  },

  getReviews: async (id: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await api.get<PaginatedResponse<Review>>(`/products/${id}/reviews?${params.toString()}`);
    return response.data;
  },

  createReview: async (id: string, data: CreateReviewBody): Promise<ApiResponse<Review>> => {
    const response = await api.post<ApiResponse<Review>>(`/products/${id}/reviews`, data);
    return response.data;
  },

  deleteReview: async (productId: string, reviewId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },
};
