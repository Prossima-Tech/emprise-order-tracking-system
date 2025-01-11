// src/types/purchase-order.ts
export enum POStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface POItem {
  id?: string;
  poId?: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications: Record<string, any>;
  status?: string;
  item?: {
    itemCode: string;
    description: string;
    unit: string;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  loaId: string;
  vendorId: string;
  value: number;
  deliveryDate: Date;
  status: POStatus | string;
  items?: POItem[];
  vendor?: {
    name: string;
    email: string;
    phone: string;
  };
  loa?: {
    loaNo: string;
    value: number;
  };
  createdAt: Date;
  updatedAt: Date;
  statusHistory?: PurchaseOrderStatusHistory[];
}

export interface PurchaseOrderStatusHistory {
  id: string;
  poId: string;
  fromStatus: string;
  toStatus: string;
  remarks?: string;
  createdAt: Date;
  createdById: string;
}

export interface POCreateInput {
  loaId: string;
  vendorId: string;
  value: number;
  deliveryDate: Date | string;
  items: Omit<POItem, 'id' | 'poId'>[];
}

export interface POMetrics {
  totalInvoiced: number;
  totalPaid: number;
  deliveryProgress: number;
  isOverdue: boolean;
  daysRemaining: number;
}

export interface POFilter {
  startDate?: Date;
  endDate?: Date;
  status?: POStatus;
  vendorId?: string;
  loaId?: string;
}

export interface POStatistics {
  totalCount: number;
  totalValue: number;
  pendingDelivery: number;
  completed: number;
  byStatus?: {
    [key in POStatus]?: number;
  };
  valueByStatus?: {
    [key in POStatus]?: number;
  };
}