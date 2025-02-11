import { useState, useCallback } from 'react';
import { useToast } from '../../../hooks/use-toast-app';
import apiClient from '../../../lib/utils/api-client';
import type { Offer, OfferFormData } from '../types/Offer';

interface OffersResponse {
  offers: Offer[];
  total: number;
  pages: number;
}

export function useOffers() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const createOffer = async (data: OfferFormData) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/budgetary-offers', data);
      showSuccess('Budgetary offer created successfully');
      return response.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to create budgetary offer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOffer = async (id: string, data: OfferFormData) => {
    try {
      setLoading(true);
      const response = await apiClient.put(`/budgetary-offers/${id}`, data);
      showSuccess('Budgetary offer updated successfully');
      return response.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update budgetary offer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.post(`/budgetary-offers/${id}/submit`);
      showSuccess('Budgetary offer submitted for approval');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to submit budgetary offer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (id: string, emailData: {
    to: string[];
    cc?: string[];
    subject: string;
    content: string;
  }) => {
    try {
      setLoading(true);
      await apiClient.post(`/budgetary-offers/${id}/send-email`, emailData);
      showSuccess('Email sent successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to send email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOffers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<OffersResponse>('/budgetary-offers');
      return response.data.offers;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to fetch budgetary offers');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const getOffer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/budgetary-offers/${id}`);
      return response.data;
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to fetch budgetary offer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOffer = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/budgetary-offers/${id}`);
      showSuccess('Budgetary offer deleted successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to delete budgetary offer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createOffer,
    updateOffer,
    submitForApproval,
    sendEmail,
    getOffer,
    getOffers,
    deleteOffer,
  };
}