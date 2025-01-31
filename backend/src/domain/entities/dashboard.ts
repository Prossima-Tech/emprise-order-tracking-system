// src/types/dashboard.ts
export interface DashboardStats {
    totalOffers: number;
    totalOrders: number;
    activeEmds: number;
    emdDueNext7Days: number;
    offersTrend: number;
    avgProcessingTime: number;
    pendingApprovals: Approval[];
  }
  
  interface Approval {
    id: string;
    type: 'offer' | 'po' | 'emd';
    title: string;
    daysPending: number;
  }
  
  // Keep existing Activity interface