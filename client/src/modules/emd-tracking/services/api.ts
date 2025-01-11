// services/emdApi.ts
import { EMDTracking, EMDFilter, EMDStatistics, EMDSubmissionInput, EMDStatusUpdateInput } from '@emprise/shared/src/types/emd';
import { PaginatedResponse } from '@emprise/shared/src/types/common';

export const emdApi = {
  
  getAll: async (filter: EMDFilter): Promise<PaginatedResponse<EMDTracking>> => {
    const queryParams = new URLSearchParams({
      page: String(filter.page || 1),
      limit: String(filter.limit || 10),
      ...(filter.status && { status: filter.status }),
      ...(filter.search && { search: filter.search }),
      ...(filter.sortBy && { sortBy: filter.sortBy }),
      ...(filter.sortOrder && { sortOrder: filter.sortOrder }),
    });

    const response = await fetch(`/api/emds?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch EMDs');
    }
    return response.json();
  },

  getStatistics: async (): Promise<EMDStatistics> => {
    const response = await fetch('/api/emds/statistics');
    if (!response.ok) {
      throw new Error('Failed to fetch EMD statistics');
    }
    return response.json();
  },

  submitEMD: async (data: EMDSubmissionInput): Promise<EMDTracking> => {
    const response = await fetch('/api/emds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to submit EMD');
    }
    return response.json();
  },

  updateStatus: async (id: string, data: EMDStatusUpdateInput): Promise<EMDTracking> => {
    const response = await fetch(`/api/emds/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update EMD status');
    }
    return response.json();
  },
};