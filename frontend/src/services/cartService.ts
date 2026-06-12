import api from './api';
import type { ApiResponse, Cart, AddToCartBody, UpdateCartBody } from '@/types';

export const cartService = {
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await api.get<ApiResponse<Cart>>('/cart');
    return response.data;
  },

  addToCart: async (data: AddToCartBody): Promise<ApiResponse<Cart>> => {
    const response = await api.post<ApiResponse<Cart>>('/cart/add', data);
    return response.data;
  },

  updateCartItem: async (data: UpdateCartBody): Promise<ApiResponse<Cart>> => {
    const response = await api.put<ApiResponse<Cart>>('/cart/update', data);
    return response.data;
  },

  removeCartItem: async (productId: string): Promise<ApiResponse<Cart>> => {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/remove/${productId}`);
    return response.data;
  },

  clearCart: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>('/cart/clear');
    return response.data;
  },
};
