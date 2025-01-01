// src/types/po.types.ts
import { Decimal } from '@prisma/client/runtime/library';

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
  unitPrice: Decimal | number;
  totalPrice: Decimal | number;
  specifications: Record<string, any>;
  status?: string;
  item?: {
    itemCode: string;
    description: string;
    unit: string;
  };
}

export interface PrismaQueryResult {
    id: string;
    poNumber: string;
    loaId: string;
    vendorId: string;
    value: Decimal;
    deliveryDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    items?: POItem[];
    vendor?: {
      name: string;
      email: string;
      phone: string;
    };
    loa?: {
      loaNo: string;
      value: Decimal;
    };
    statusHistory?: PurchaseOrderStatusHistory[];
  }

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    loaId: string;
    vendorId: string;
    value: Decimal;
    deliveryDate: Date;
    status: POStatus | string;
    items?: POItem[];  // Make items optional
    vendor?: {
      name: string;
      email: string;
      phone: string;
    };
    loa?: {
      loaNo: string;
      value: Decimal;
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
  value: Decimal | number;
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