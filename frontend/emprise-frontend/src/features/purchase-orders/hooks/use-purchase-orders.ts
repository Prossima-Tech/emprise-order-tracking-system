import { useState } from 'react';
import { useToast } from '../../../hooks/use-toast-app';
import apiClient from '../../../lib/utils/api-client';
import type { PurchaseOrderFormData } from '../types/purchase-order';

export function usePurchaseOrders() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const createPurchaseOrder = async (data: PurchaseOrderFormData) => {
    try {
      setLoading(true);
      console.log('Creating PO with data:', data); // Debug log

      const response = await apiClient.post('/purchase-orders', data);
      console.log('PO creation response:', response); // Debug log

      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to create purchase order');
      }

      showSuccess('Purchase order created successfully');
      return response.data;
    } catch (error: any) {
      console.error('PO creation error:', error.response || error); // Detailed error log
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        showError('Invalid data provided. Please check your inputs.');
      } else if (error.response?.status === 401) {
        showError('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        showError('You do not have permission to create purchase orders.');
      } else {
        showError(error.response?.data?.message || 'Failed to create purchase order');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/purchase-orders/${id}/submit`);
      
      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to submit purchase order');
      }
      
      showSuccess('Purchase order submitted for approval');
    } catch (error: any) {
      console.error('Submit for approval error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to submit purchase order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(`/purchase-orders/${id}/status`, { status: 'COMPLETED' });
      
      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to update purchase order status');
      }
      
      showSuccess('Purchase order marked as completed');
    } catch (error: any) {
      console.error('Mark as completed error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to update purchase order status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/purchase-orders');
      
      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to fetch purchase orders');
      }
      
      return response.data?.data?.data?.purchaseOrders || [];
    } catch (error: any) {
      console.error('Get POs error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to fetch purchase orders');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/purchase-orders/${id}`);
      
      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to fetch purchase order');
      }
      
      return response.data?.data?.data;
    } catch (error: any) {
      console.error('Get PO error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to fetch purchase order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseOrder = async (id: string, data: PurchaseOrderFormData) => {
    try {
      setLoading(true);
      console.log('Updating PO with data:', data); // Debug log

      const response = await apiClient.put(`/purchase-orders/${id}`, data);
      console.log('PO update response:', response); // Debug log

      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to update purchase order');
      }

      showSuccess('Purchase order updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('PO update error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to update purchase order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.delete(`/purchase-orders/${id}`);
      
      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to delete purchase order');
      }
      
      showSuccess('Purchase order deleted successfully');
    } catch (error: any) {
      console.error('Delete PO error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to delete purchase order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createPurchaseOrder,
    submitForApproval,
    markAsCompleted,
    getPurchaseOrders,
    getPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  };
}