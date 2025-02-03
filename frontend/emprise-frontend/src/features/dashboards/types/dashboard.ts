export interface StatisticCard {
    title: string;
    value: number | string;
    description: string;
    trend?: {
      value: number;
      direction: 'up' | 'down';
    };
    icon: React.ComponentType<any>;
  }
  
  export interface Activity {
    id: string;
    type: 'offer' | 'emd' | 'po';
    title: string;
    description: string;
    timestamp: string;
    status: string;
  }

  export interface OfferStatus {
    name: string;
    value: number;
    color: string;
  }

  export interface EMDMaturity {
    range: string;
    count: number;
  }

  export interface TrendData {
    month: string;
    offers: number;
    orders: number;
  }

  export interface Metric {
    label: string;
    value: number;
    total: number;
    color: string;
  }

  export interface EMDMaturityData {
    range: string;
    count: number;
  }

  export interface DashboardStats {
    totalOffers: number;
    totalOrders: number;
    activeEmds: number;
    activeEmdsValue: number;
    offersTrend: number;
    ordersTrend: number;
    offerStatus: Array<{ name: string; value: number; color: string }>;
    emdMaturity: Array<{ range: string; count: number }>;
    metrics: any[];
  }