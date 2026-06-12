import api from './api';
import type { ApiResponse, DashboardStats, SalesReport, InventoryReport } from '@/types';

export const adminService = {
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return response.data;
  },

  getSalesReport: async (startDate?: string, endDate?: string): Promise<ApiResponse<SalesReport[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get<ApiResponse<SalesReport[]>>(`/admin/reports/sales?${params.toString()}`);
    return response.data;
  },

  getInventoryReport: async (): Promise<ApiResponse<InventoryReport[]>> => {
    const response = await api.get<ApiResponse<InventoryReport[]>>('/admin/reports/inventory');
    return response.data;
  },
};
