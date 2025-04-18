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
      
      // Ensure all LOAs have a status value
      const loas = response.data.data.loas || [];
      loas.forEach((loa: any) => {
        if (!loa.status) {
          loa.status = "DRAFT"; // Default to DRAFT if status is missing
        }
      });
      
      return loas;
    } catch (error: any) {
      console.error('Error in getLOAs:', error);
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
      
      const loaData = response.data.data;
      
      // Ensure status is present in the response
      if (!loaData.status) {
        loaData.status = "DRAFT"; // Default to DRAFT if status is missing
      }
      
      return loaData;
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
        } else if (key === 'securityDepositFile' && value && data.hasSecurityDeposit) {
          formData.append(key, value);
        } else if (key === 'performanceGuaranteeFile' && value && data.hasPerformanceGuarantee) {
          formData.append(key, value);
        } else if (key === 'deliveryPeriod') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'tags') {
          const uniqueTags = Array.from(new Set(value))
            .map((tag: any) => tag.trim())
            .filter(Boolean);
          formData.append(key, JSON.stringify(uniqueTags));
        } else if (key === 'hasEmd' || key === 'hasSecurityDeposit' || key === 'hasPerformanceGuarantee') {
          formData.append(key, String(value));
        } else if (key === 'emdAmount' && data.hasEmd) {
          formData.append(key, String(value || 0));
        } else if (key === 'securityDepositAmount' && data.hasSecurityDeposit) {
          formData.append(key, String(value || 0));
        } else if (key === 'performanceGuaranteeAmount' && data.hasPerformanceGuarantee) {
          formData.append(key, String(value || 0));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.post('/loas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // The server response from LoaController
      // Check if the response has a status field (indicating it's in the new format)
      if (response.data && response.data.status === 'success') {
        showSuccess('LOA created successfully');
        return response.data.data;
      } else if (response.data) {
        // Handle legacy or different response format
        showSuccess('LOA created successfully');
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
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

  const updateLOAStatus = async (id: string, status: LOA['status'], reason?: string) => {
    try {
      setLoading(true);
      const response = await apiClient.put(`/loas/${id}/status`, { status, reason });
      showSuccess('LOA status updated successfully');
      return response.data.data;
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
        } else if (key === 'securityDepositFile' && value && data.hasSecurityDeposit) {
          formData.append(key, value);
        } else if (key === 'performanceGuaranteeFile' && value && data.hasPerformanceGuarantee) {
          formData.append(key, value);
        } else if (key === 'deliveryPeriod') {
          const formattedPeriod = {
            start: value.start instanceof Date ? value.start.toISOString() : value.start,
            end: value.end instanceof Date ? value.end.toISOString() : value.end
          };
          formData.append(key, JSON.stringify(formattedPeriod));  
        } else if (key === 'tags') {
          let tagsToSend = [];
          if (Array.isArray(value)) {
            tagsToSend = value.filter(tag => tag && tag.trim()).map(tag => tag.trim());
          }
          formData.append(key, JSON.stringify(tagsToSend));
        } else if (key === 'hasEmd' || key === 'hasSecurityDeposit' || key === 'hasPerformanceGuarantee') {
          formData.append(key, String(value));
        } else if (key === 'emdAmount' && data.hasEmd) {
          formData.append(key, String(value || 0));
        } else if (key === 'securityDepositAmount' && data.hasSecurityDeposit) {
          formData.append(key, String(value || 0));
        } else if (key === 'performanceGuaranteeAmount' && data.hasPerformanceGuarantee) {
          formData.append(key, String(value || 0));
        } else if (value !== null && value !== undefined) {
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

  // Modify the function to return an empty array without making an API call
  const getAvailableEMDs = async () => {
    // EMD module has been removed, so return an empty array
    return [];
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