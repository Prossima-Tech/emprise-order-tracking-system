// src/modules/dashboard/services/index.ts
import api from '../../../config/axios';
import type { DashboardStats, RevenueData, Activity } from '../types';

export const dashboardApi = {
  getStatistics: () => 
    api.get<DashboardStats>('/dashboard/statistics'),
  
  getRevenueData: () => 
    api.get<RevenueData[]>('/dashboard/revenue'),
  
  getRecentActivities: () => 
    api.get<Activity[]>('/dashboard/activities'),
};