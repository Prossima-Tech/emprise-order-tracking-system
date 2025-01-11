// src/modules/loa-management/services/loaApi.ts
import api from '../../../config/axios';
import type {
  LOA,
  LOARecordInput,
  LOAAmendment,
  LOAAmendmentInput,
  LOAUtilization,
  LOADocument
} from '../../../types/loa';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const loaApi = {
  async getAllLOAs(): Promise<LOA[]> {
    try {
      const response = await api.get<ApiResponse<LOA[]>>('/loa');
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch LOAs',
        error.response?.status
      );
    }
  },

  async getLOAById(id: string): Promise<LOA> {
    try {
      const response = await api.get<ApiResponse<LOA>>(`/loa/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch LOA details',
        error.response?.status
      );
    }
  },

  async recordLOA(data: LOARecordInput): Promise<LOA> {
    try {
      const response = await api.post<ApiResponse<LOA>>('/loa', data);
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to record LOA',
        error.response?.status
      );
    }
  },

  async updateLOA(id: string, data: Partial<LOARecordInput>): Promise<LOA> {
    try {
      const response = await api.put<ApiResponse<LOA>>(`/loa/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to update LOA',
        error.response?.status
      );
    }
  },

  async getAmendments(loaId: string): Promise<LOAAmendment[]> {
    try {
      const response = await api.get<ApiResponse<LOAAmendment[]>>(`/loa/${loaId}/amendments`);
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch amendments',
        error.response?.status
      );
    }
  },

  async recordAmendment(loaId: string, data: LOAAmendmentInput): Promise<LOAAmendment> {
    try {
      const response = await api.post<ApiResponse<LOAAmendment>>(`/loa/${loaId}/amendments`, data);
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to record amendment',
        error.response?.status
      );
    }
  },

  async approveAmendment(loaId: string, amendmentId: string): Promise<LOAAmendment> {
    try {
      const response = await api.patch<ApiResponse<LOAAmendment>>(
        `/loa/${loaId}/amendments/${amendmentId}/approve`
      );
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to approve amendment',
        error.response?.status
      );
    }
  },

  async getUtilization(loaId: string): Promise<LOAUtilization> {
    try {
      const response = await api.get<ApiResponse<LOAUtilization>>(`/loa/${loaId}/utilization`);
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch utilization data',
        error.response?.status
      );
    }
  },

  async getDocuments(loaId: string): Promise<LOADocument[]> {
    try {
      const response = await api.get<ApiResponse<LOADocument[]>>(`/loa/${loaId}/documents`);
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch documents',
        error.response?.status
      );
    }
  },

  async uploadDocument(loaId: string, formData: FormData): Promise<LOADocument> {
    try {
      const response = await api.post<ApiResponse<LOADocument>>(
        `/loa/${loaId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to upload document',
        error.response?.status
      );
    }
  },

  async deleteDocument(loaId: string, documentId: string): Promise<void> {
    try {
      await api.delete(`/loa/${loaId}/documents/${documentId}`);
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to delete document',
        error.response?.status
      );
    }
  },

  async downloadDocument(loaId: string, documentId: string): Promise<string> {
    try {
      const response = await api.get(`/loa/${loaId}/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      return url;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to download document',
        error.response?.status
      );
    }
  },

  // Utility method to handle file downloads
  async downloadFile(url: string, filename: string): Promise<void> {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
