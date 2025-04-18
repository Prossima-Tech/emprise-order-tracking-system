import { useState, useCallback } from 'react';
import { useToast } from '../../../hooks/use-toast-app';
import apiClient from '../../../lib/utils/api-client';

// Types for customers
export interface Customer {
  id: string;
  name: string;
  headquarters: string;
  code?: string; // For UI display purposes
  region?: string; // For UI display purposes
  createdAt?: string;
  updatedAt?: string;
  siteCount?: number; // Number of sites associated with this customer
}

export interface CustomerFormData {
  id: string;
  name: string;
  headquarters: string;
}

interface APIResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export function useCustomers() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const getCustomers = useCallback(async (): Promise<Customer[]> => {
    try {
      setLoading(true);
      const response = await apiClient.get<APIResponse<Customer[]>>('/customers');

      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to fetch customers');
      }

      // Transform customer data for UI if needed
      const customers = response.data.data.map(customer => ({
        ...customer,
        code: customer.id, // Use customer ID as customer code
        region: customer.headquarters.split(', ')[1] || 'India', // Extract region from headquarters or default to India
        createdAt: customer.createdAt || new Date().toISOString(),
        updatedAt: customer.updatedAt || new Date().toISOString(),
        siteCount: 0 // Initialize site count
      }));

      // Fetch site counts for each customer
      try {
        const sitesResponse = await apiClient.get<APIResponse<any>>('/sites/counts-by-zone');
        if (sitesResponse.data && sitesResponse.data.status === 'success') {
          const siteCounts = sitesResponse.data.data;
          customers.forEach(customer => {
            customer.siteCount = siteCounts[customer.id] || 0;
          });
        }
      } catch (siteError) {
        console.warn('Could not fetch site counts:', siteError);
        // Don't fail the whole operation if site counts can't be fetched
      }

      return customers;
    } catch (error: any) {
      console.error('Get customers error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to fetch customers');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const getCustomer = useCallback(async (id: string): Promise<Customer> => {
    try {
      setLoading(true);
      const response = await apiClient.get<APIResponse<Customer>>(`/customers/${id}`);

      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to fetch customer');
      }

      const customerData = response.data.data;
      const customer: Customer = {
        ...customerData,
        code: customerData.id,
        region: customerData.headquarters.split(', ')[1] || 'India',
        createdAt: customerData.createdAt || new Date().toISOString(),
        updatedAt: customerData.updatedAt || new Date().toISOString()
      };

      return customer;
    } catch (error: any) {
      console.error('Get customer error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to fetch customer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const createCustomer = useCallback(async (data: CustomerFormData): Promise<Customer> => {
    try {
      setLoading(true);
      const customerData = {
        id: data.id.toUpperCase(), // Ensure proper format
        name: data.name,
        headquarters: data.headquarters
      };

      const response = await apiClient.post<APIResponse<Customer>>('/customers', customerData);

      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to create customer');
      }

      showSuccess('Customer created successfully');
      
      const newCustomer = response.data.data;
      const customer: Customer = {
        ...newCustomer,
        code: newCustomer.id,
        region: newCustomer.headquarters.split(', ')[1] || 'India',
        createdAt: newCustomer.createdAt || new Date().toISOString(),
        updatedAt: newCustomer.updatedAt || new Date().toISOString()
      };

      return customer;
    } catch (error: any) {
      console.error('Create customer error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to create customer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const updateCustomer = useCallback(async (id: string, data: CustomerFormData): Promise<Customer> => {
    try {
      setLoading(true);
      const customerData = {
        name: data.name,
        headquarters: data.headquarters
      };

      const response = await apiClient.put<APIResponse<Customer>>(`/customers/${id}`, customerData);

      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Failed to update customer');
      }

      showSuccess('Customer updated successfully');
      
      const updatedCustomer = response.data.data;
      const customer: Customer = {
        ...updatedCustomer,
        code: updatedCustomer.id,
        region: updatedCustomer.headquarters.split(', ')[1] || 'India',
        createdAt: updatedCustomer.createdAt || new Date().toISOString(),
        updatedAt: updatedCustomer.updatedAt || new Date().toISOString()
      };

      return customer;
    } catch (error: any) {
      console.error('Update customer error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to update customer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiClient.delete(`/customers/${id}`);

      // API returns 204 No Content for delete operations
      if (response.status !== 204) {
        throw new Error('Failed to delete customer');
      }

      showSuccess('Customer deleted successfully');
    } catch (error: any) {
      console.error('Delete customer error:', error.response || error);
      showError(error.response?.data?.message || 'Failed to delete customer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  return {
    loading,
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
} 