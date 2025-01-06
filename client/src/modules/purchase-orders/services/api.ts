// src/modules/purchase-orders/services/api.ts
import api from '../../../config/axios';
import type { 
  PurchaseOrder, 
  POCreateInput, 
  POFilter,
  POStatistics // Make sure to create this interface
} from '@emprise/shared/src/types/purchase-order';
import type { 
  PaginatedResponse,
  ApiResponse 
} from '@emprise/shared/src/types/common';

export const purchaseOrderApi = {
  createPO: async (data: POCreateInput): Promise<PurchaseOrder> => {
    const response = await api.post<ApiResponse<PurchaseOrder>>('/purchase-orders', data);
    return response.data.data;
  },
  
  updateStatus: async (id: string, status: string, remarks?: string): Promise<PurchaseOrder> => {
    const response = await api.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/status`, { status, remarks });
    return response.data.data;
  },
  
  getPODetails: async (id: string): Promise<PurchaseOrder> => {
    const response = await api.get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`);
    return response.data.data;
  },
  
  listPOs: async (params?: POFilter): Promise<PaginatedResponse<PurchaseOrder>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<PurchaseOrder>>>('/purchase-orders', { params });
    return response.data.data;
  },
  
  updatePO: async (id: string, data: Partial<POCreateInput>): Promise<PurchaseOrder> => {
    const response = await api.put<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`, data);
    return response.data.data;
  },
  
  getStatistics: async (): Promise<POStatistics> => {
    const response = await api.get<ApiResponse<POStatistics>>('/purchase-orders/statistics');
    return response.data.data;
  },
};