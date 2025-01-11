// src/modules/dashboard/types/index.ts
export interface DashboardStats {
    totalPurchaseOrders: number;
    activeLOAs: number;
    pendingApprovals: number;
    emdSubmissions: number;
  }
  
  export interface RevenueData {
    date: string;
    value: number;
    category: string;
  }
  
  export interface Activity {
    id: string;
    type: string;
    description: string;
    user: {
      name: string;
      avatar: string;
    };
    timestamp: string;
  }