import api from './api';
import type { ApiResponse, Order, PaginatedResponse, PlaceOrderBody } from '@/types';

export const orderService = {
  placeOrder: async (data: PlaceOrderBody): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  listOrders: async (page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    const response = await api.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
    return response.data;
  },

  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data;
  },

  cancelOrder: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return response.data;
  },
};
