// src/modules/budgetary-offer/services/index.ts
import api from '../../../config/axios';
import type { 
  BudgetaryOffer, 
  BudgetaryOfferCreateInput,
} from '@emprise/shared/src/types/budgetary-offer';
import type { 
  PaginatedResponse,
  ApiResponse 
} from '@emprise/shared/src/types/common';

export const budgetaryOfferService = {
  getAll: async (params?: any): Promise<PaginatedResponse<BudgetaryOffer>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<BudgetaryOffer>>>('/budgetary-offers', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<BudgetaryOffer> => {
    const response = await api.get<ApiResponse<BudgetaryOffer>>(`/budgetary-offers/${id}`);
    return response.data.data;
  },

  create: async (data: BudgetaryOfferCreateInput): Promise<BudgetaryOffer> => {
    const response = await api.post<ApiResponse<BudgetaryOffer>>('/budgetary-offers', data);
    return response.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<BudgetaryOffer> => {
    const response = await api.patch<ApiResponse<BudgetaryOffer>>(`/budgetary-offers/${id}/status`, { status });
    return response.data.data;
  },

  getStatistics: async () => {
    const response = await api.get<ApiResponse<any>>('/budgetary-offers/statistics');
    return response.data.data;
  },
};