// services/masterDataApi.ts
import { ItemMaster, Vendor, VendorStatus, DashboardStats, MatchingData, TrendDataPoint } from '@emprise/shared/src/types/master';
import { PaginatedResponse } from '@emprise/shared/src/types/common';

interface ItemFilter {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface VendorFilter {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: VendorStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const masterDataApi = {
  // Item Master APIs
  getAllItems: async (filter: ItemFilter): Promise<PaginatedResponse<ItemMaster>> => {
    const queryParams = new URLSearchParams({
      page: String(filter.page || 1),
      limit: String(filter.limit || 10),
      ...(filter.search && { search: filter.search }),
      ...(filter.category && { category: filter.category }),
      ...(filter.isActive !== undefined && { isActive: String(filter.isActive) }),
      ...(filter.sortBy && { sortBy: filter.sortBy }),
      ...(filter.sortOrder && { sortOrder: filter.sortOrder }),
    });

    const response = await fetch(`/api/master/items?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    return response.json();
  },

  getItemById: async (id: string): Promise<ItemMaster> => {
    const response = await fetch(`/api/master/items/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch item');
    }
    return response.json();
  },

  createItem: async (data: Partial<ItemMaster>): Promise<ItemMaster> => {
    const response = await fetch('/api/master/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create item');
    }
    return response.json();
  },

  updateItem: async (id: string, data: Partial<ItemMaster>): Promise<ItemMaster> => {
    const response = await fetch(`/api/master/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update item');
    }
    return response.json();
  },

  // Vendor Master APIs
  getAllVendors: async (filter: VendorFilter): Promise<PaginatedResponse<Vendor>> => {
    const queryParams = new URLSearchParams({
      page: String(filter.page || 1),
      limit: String(filter.limit || 10),
      ...(filter.search && { search: filter.search }),
      ...(filter.category && { category: filter.category }),
      ...(filter.status && { status: filter.status }),
      ...(filter.isActive !== undefined && { isActive: String(filter.isActive) }),
      ...(filter.sortBy && { sortBy: filter.sortBy }),
      ...(filter.sortOrder && { sortOrder: filter.sortOrder }),
    });

    const response = await fetch(`/api/master/vendors?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vendors');
    }
    return response.json();
  },

  getVendorById: async (id: string): Promise<Vendor> => {
    const response = await fetch(`/api/master/vendors/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vendor');
    }
    return response.json();
  },

  createVendor: async (data: Partial<Vendor>): Promise<Vendor> => {
    const response = await fetch('/api/master/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create vendor');
    }
    return response.json();
  },

  updateVendor: async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
    const response = await fetch(`/api/master/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update vendor');
    }
    return response.json();
  },

  updateVendorStatus: async (id: string, status: VendorStatus, remarks: string): Promise<Vendor> => {
    const response = await fetch(`/api/master/vendors/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks }),
    });
    if (!response.ok) {
      throw new Error('Failed to update vendor status');
    }
    return response.json();
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await fetch('/api/master/dashboard/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return response.json();
  },

  getMatchingData: async (type: string): Promise<MatchingData[]> => {
    const response = await fetch(`/api/master/dashboard/matching?type=${type}`);
    if (!response.ok) {
      throw new Error('Failed to fetch matching data');
    }
    return response.json();
  },

  getTrendData: async (): Promise<TrendDataPoint[]> => {
    const response = await fetch('/api/master/dashboard/trends');
    if (!response.ok) {
      throw new Error('Failed to fetch trend data');
    }
    return response.json();
  },
};