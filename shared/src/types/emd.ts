// src/types/emd.types.ts
import { Decimal } from '@prisma/client/runtime/library';

export enum EMDStatus {
  PENDING = 'PENDING',    // Initial state when EMD is required
  SUBMITTED = 'SUBMITTED', // EMD has been submitted
  VERIFIED = 'VERIFIED',  // EMD has been verified
  RETURNED = 'RETURNED',  // EMD has been returned
  OVERDUE = 'OVERDUE',    // EMD is overdue
  FORFEITED = 'FORFEITED' // EMD has been forfeited
}

export interface EMDTracking {
  id: string;
  tenderNo: string;
  amount: number;  // Changed from Decimal to number
  submissionDate: Date;
  validityPeriod: Date;
  returnDueDate: Date;
  status: EMDStatus;
  bankName: string;
  instrumentNo: string;
  instrumentType: EMDInstrumentType;
  customerName: string;
  department: string;
  projectCode: string;
  remarks?: string;
  returnedDate?: Date | null;
  returnedBy?: {
    id: string;
    name: string;
  } | null;
}

export type EMDInstrumentType = 'BANK_GUARANTEE' | 'DEMAND_DRAFT';

export interface EMDStatistics {
  total: number;
  totalAmount: number;
  overdueCount: number;
  returnedAmount: number;
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
  totalAmount: number;
  byStatus: Record<EMDStatus, number>;
  overdueCount: number;
  returnedAmount: number;
  forfeitedAmount: number;
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
  dateRange: [Date | null, Date | null];
}

export interface EMDListProps {
  emds: EMDTracking[];
  loading: boolean;
  onRefresh: () => void;
  onView?: (emd: EMDTracking) => void;
  onFilterChange?: (filters: EMDFilter) => void;
  onStatusUpdate?: (emd: EMDTracking) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}