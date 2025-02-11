import { useState } from 'react';
import { useToast } from '../../../hooks/use-toast-app';
import apiClient from '../../../lib/utils/api-client';
import type { LOA, LOAFormData, AmendmentFormData } from '../types/loa';

export function useLOAs() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleError = (error: any, defaultMessage: string) => {
    console.error('API Error:', error);
    
    if (error?.response?.data?.message) {
      showError(error.response.data.message);
    } else if (error?.code === 'P2002') {
      // Handle unique constraint violation
      showError('This LOA number already exists. Please use a different one.');
    } else {
      showError(defaultMessage);
    }
    
    throw error;
  };

  // Get all LOAs
  const getLOAs = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get('/loas');
      if (!response.data || !response.data.data) {
        console.warn('Unexpected API response structure:', response);
        return [];
      }
      
      return response.data.data.loas;
    } catch (error: any) {
      console.error('Error in getLOAs:', error);
      console.error('Error response:', error.response);
      showError(error.response?.data?.message || 'Failed to fetch LOAs');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get single LOA by ID
  const getLOAById = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/loas/${id}`);
      return response.data.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to fetch LOA details');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createLOA = async (data: LOAFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'documentFile' && value) {
          formData.append(key, value);
        } else if (key === 'deliveryPeriod') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'tags') {
          const uniqueTags = Array.from(new Set(value))
            .map((tag: any) => tag.trim())
            .filter(Boolean);
          formData.append(key, JSON.stringify(uniqueTags));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.post('/loas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from server');
      }

      showSuccess('LOA created successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('Error in createLOA:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create LOA';
      showError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAmendment = async (loaId: string, data: AmendmentFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
    
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'documentFile' && value) {
          formData.append(key, value);
        } else if (key === 'tags') {
          const uniqueTags = Array.from(new Set(value))
            .map((tag: any) => tag.trim())
            .filter(Boolean);
          formData.append(key, JSON.stringify(uniqueTags));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.post(`/loas/${loaId}/amendments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      showSuccess('Amendment created successfully');
      return response.data.data;
    } catch (error: any) {
      handleError(error, 'Failed to create amendment');
    } finally {
      setLoading(false);
    }
  };

  const updateLOAStatus = async (id: string, status: LOA['status']) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(`/loas/${id}/status`, { status });
      showSuccess('LOA status updated successfully');
      return response.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update LOA status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLOA = async (id: string, data: LOAFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'documentFile' && value) {
          formData.append(key, value);
        } else if (key === 'deliveryPeriod') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'tags') {
          const uniqueTags = Array.from(new Set(value))
            .map((tag: any) => tag.trim())
            .filter(Boolean);
          formData.append(key, JSON.stringify(uniqueTags));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.put(`/loas/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showSuccess('LOA updated successfully');
      return response.data.data;
    } catch (error: any) {
      handleError(error, 'Failed to update LOA');
    } finally {
      setLoading(false);
    }
  };

  const deleteLOA = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/loas/${id}`);
      showSuccess('LOA deleted successfully');
    } catch (error: any) {
      handleError(error, 'Failed to delete LOA');
    } finally {
      setLoading(false);
    }
  };

  const deleteAmendment = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/loas/amendments/${id}`);
      showSuccess('Amendment deleted successfully');
    } catch (error: any) {
      handleError(error, 'Failed to delete amendment');
    } finally {
      setLoading(false);
    }
  };

  // Add new function to fetch available EMDs
  const getAvailableEMDs = async () => {
    try {
      const response = await apiClient.get('/emds');
      // Filter EMDs that don't have a loaId (not associated with any LOA)
      const availableEMDs = response.data.data.data.filter((emd: any) => !emd.loa);

      return availableEMDs;
    } catch (error) {
      console.error('Error fetching available EMDs:', error);
      showError('Failed to fetch available EMDs');
      return [];
    }
  };

  return {
    loading,
    getLOAs,
    getLOAById,
    createLOA,
    updateLOA,
    deleteLOA,
    createAmendment,
    deleteAmendment,
    updateLOAStatus,
    getAvailableEMDs,
  };
}