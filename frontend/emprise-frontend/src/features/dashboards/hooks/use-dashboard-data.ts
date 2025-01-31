import { useState, useEffect } from 'react';
import apiClient from '../../../lib/utils/api-client';
import { Activity } from '../types/dashboard';
import { useToast } from '../../../hooks/use-toast-app';

interface DashboardStats {
  totalOffers: number;
  totalOrders: number;
  activeEmds: number;
  offersTrend: number;
  ordersTrend: number;
  offerStatus: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  emdMaturity: Array<{
    range: string;
    count: number;
  }>;
}

interface TrendData {
  month: string;
  offers: number;
  orders: number;
}

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const { showError } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, activitiesRes, trendsRes] = await Promise.all([
          apiClient.get<{ status: string; data: DashboardStats }>('/dashboard/stats'),
          apiClient.get<{ status: string; data: Activity[] }>('/dashboard/activities'),
          apiClient.get<{ status: string; data: TrendData[] }>('/dashboard/trends')
        ]);

        if (statsRes.data.status === 'success') {
          setStats(statsRes.data.data);
        }
        if (activitiesRes.data.status === 'success') {
          setActivities(activitiesRes.data.data);
        }
        if (trendsRes.data.status === 'success') {
          setTrends(trendsRes.data.data);
        }
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to fetch dashboard data';
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    loading,
    error,
    stats,
    activities,
    trends,
  };
}
