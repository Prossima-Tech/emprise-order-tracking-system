import { useState } from 'react';
import { useToast } from '../../../hooks/use-toast-app';
import apiClient from '../../../lib/utils/api-client';
import type { EMD, EMDFormData, EMDResponse } from '../types/emd';

export function useEMDs() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // GET /emds - Get all EMDs
  const getAllEMDs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<EMDResponse>('/emds');
      // Handle the list response structure
      if ('data' in response.data.data) {
        return response.data.data.data || [];
      }
      return [];
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to fetch EMDs');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // GET /emds/{id} - Get EMD by ID
  const getEMDById = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get<EMDResponse>(`/emds/${id}`);
      // Handle the single EMD response structure
      return response.data.data as EMD;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to fetch EMD details');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // POST /emds - Create new EMD
  const createEMD = async (data: EMDFormData) => {
    try {
      setLoading(true);
      // Create FormData for file upload
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'documentFile' && value) {
          formData.append('document', value);
        } else if (key === 'tags') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.post('/emds', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showSuccess('EMD created successfully');
      return response.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to create EMD');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // PUT /emds/{id} - Update an existing EMD
  const updateEMD = async (id: string, data: Partial<EMDFormData>) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'documentFile' && value) {
          formData.append(key, value);
        } else if (key === 'tags') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.put(`/emds/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showSuccess('EMD updated successfully');
      return response.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update EMD');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // DELETE /emds/{id} - Delete EMD
  const deleteEMD = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/emds/${id}`);
      showSuccess('EMD deleted successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to delete EMD');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // PATCH /emds/{id}/status - Update EMD status
  const updateEMDStatus = async (id: string, status: EMD['status']) => {
    try {
      setLoading(true);
      const response = await apiClient.patch<EMDResponse>(`/emds/${id}/status`, { status });
      showSuccess('EMD status updated successfully');
      return response.data.data as EMD;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update EMD status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // GET /emds/expiring/list - Get expiring EMDs
  const getExpiringEMDs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/emds/expiring/list');
      return response.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to fetch expiring EMDs');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getAllEMDs,
    getEMDById,
    createEMD,
    updateEMD,
    deleteEMD,
    updateEMDStatus,
    getExpiringEMDs,
  };
}