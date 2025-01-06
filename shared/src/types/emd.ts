// src/types/emd.types.ts
import { Decimal } from '@prisma/client/runtime/library';

export enum EMDStatus {
  PENDING = 'PENDING',    // Initial state when EMD is required
  SUBMITTED = 'SUBMITTED', // EMD has been submitted
  VERIFIED = 'VERIFIED',  // EMD has been verified
  RETURNED = 'RETURNED',  // EMD has been returned
  FORFEITED = 'FORFEITED' // EMD has been forfeited
}

export interface EMDTracking {
  id: string;
  offerId: string;
  amount: Decimal;
  dueDate: Date;
  submissionDate?: Date;
  returnDate?: Date;
  status: EMDStatus;
  documentPath?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
  offer?: {
    tenderNo: string;
    amount: Decimal;
    createdBy: {
      name: string;
      email: string;
    };
  };
}

export interface EMDSubmissionInput {
  offerId: string;
  amount: Decimal | number;
  dueDate: Date | string;
  remarks?: string;
}

export interface EMDStatusUpdateInput {
  status: EMDStatus;
  remarks?: string;
  documentPath?: string;
}

export interface EMDStatistics {
  total: number;
  totalAmount: Decimal;
  byStatus: Record<EMDStatus, number>;
  overdueCount: number;
  returnedAmount: Decimal;
  forfeitedAmount: Decimal;
}

export interface EMDFilter {
  page?: number;
  limit?: number;
  status?: EMDStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  offerId?: string;
  vendorId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EMDListProps {
  emds: EMDTracking[];
  loading: boolean;
  onRefresh: () => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}