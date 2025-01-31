// src/features/items/hooks/use-items.ts
import { useState, useCallback } from 'react';
import { useToast } from '../../../hooks/use-toast-app';
import apiClient from '../../../lib/utils/api-client';
import type { ItemFormData } from '../types/item';

export function useItems() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const getItems = useCallback(async () => {
    try {
      const response = await apiClient.get('/items');
      return response.data.data.data.items;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to fetch items');
      throw error;
    }
  }, [showError]);

  const getItem = useCallback(async (id: string) => {
    try {
      const response = await apiClient.get(`/items/${id}`);
      return response.data.data.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to fetch item');
      throw error;
    }
  }, [showError]);

  const createItem = useCallback(async (data: ItemFormData) => {
    try {
      const response = await apiClient.post('/items', data);
      return response.data.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to create item');
      throw error;
    }
  }, [showError]);

  const updateItem = useCallback(async (id: string, data: ItemFormData) => {
    try {
      const response = await apiClient.put(`/items/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update item');
      throw error;
    }
  }, [showError]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to delete item with ID: ${id}`);
      
      await apiClient.delete(`/items/${id}`);
      // If the delete request doesn't throw an error, consider it successful
      showSuccess('Item deleted successfully');
      return true;

    } catch (error: any) {
      console.error('Delete API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || 'Failed to delete item';
      showError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const addVendor = useCallback(async (itemId: string, data: { vendorId: string; unitPrice: number }) => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/items/${itemId}/vendors`, data);
      showSuccess('Vendor added successfully');
      return response.data.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to add vendor');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const updateVendor = useCallback(async (itemId: string, vendorId: string, data: { unitPrice: number }) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(`/items/${itemId}/vendors/${vendorId}`, data);
      showSuccess('Vendor price updated successfully');
      return response.data.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update vendor price');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const removeVendor = useCallback(async (itemId: string, vendorId: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/items/${itemId}/vendors/${vendorId}`);
      showSuccess('Vendor removed successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to remove vendor');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  return {
    loading,
    getItems,
    getItem,
    deleteItem,
    createItem,
    updateItem,
    addVendor,
    updateVendor,
    removeVendor,
  };
}