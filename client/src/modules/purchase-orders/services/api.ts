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
  ApiResponse,

} from '@emprise/shared/src/types/common';

import type {
  Vendor,
  ItemMaster as Item
} from '@emprise/shared/src/types/master';


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
  
  // New vendor methods
  getVendors: async (params?: { 
    search?: string; 
    status?: string; 
    page?: number; 
    limit?: number 
  }): Promise<PaginatedResponse<Vendor>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Vendor>>>('/vendors', { params });
    return response.data.data;
  },

  getVendorById: async (id: string): Promise<Vendor> => {
    const response = await api.get<ApiResponse<Vendor>>(`/vendors/${id}`);
    return response.data.data;
  },

  getActiveVendors: async (): Promise<Vendor[]> => {
    // This is a convenience method that gets all active vendors without pagination
    const response = await api.get<ApiResponse<Vendor[]>>('/vendors/active');
    return response.data.data;
  },

  // New item methods
  getItems: async (params?: { 
    search?: string; 
    status?: string;
    page?: number; 
    limit?: number 
  }): Promise<PaginatedResponse<Item>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Item>>>('/items', { params });
    return response.data.data;
  },

  getItemById: async (id: string): Promise<Item> => {
    const response = await api.get<ApiResponse<Item>>(`/items/${id}`);
    return response.data.data;
  },

  getActiveItems: async (): Promise<Item[]> => {
    // This is a convenience method that gets all active items without pagination
    const response = await api.get<ApiResponse<Item[]>>('/items/active');
    return response.data.data;
  },

  // Helper method to get item specifications
  getItemSpecifications: async (itemId: string): Promise<Record<string, any>> => {
    const response = await api.get<ApiResponse<Record<string, any>>>(`/items/${itemId}/specifications`);
    return response.data.data;
  }
};

// Optional: Create separate services if the logic grows
export const vendorApi = {
  list: purchaseOrderApi.getVendors,
  getById: purchaseOrderApi.getVendorById,
  getActive: purchaseOrderApi.getActiveVendors,
};

export const itemApi = {
  list: purchaseOrderApi.getItems,
  getById: purchaseOrderApi.getItemById,
  getActive: purchaseOrderApi.getActiveItems,
  getSpecifications: purchaseOrderApi.getItemSpecifications,
};