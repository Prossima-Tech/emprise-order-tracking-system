import { User } from './index';

export enum BudgetaryOfferStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED'
}

export enum EMDPaymentMode {
  FDR = 'FDR'  // Only FDR is allowed
}

export interface WorkItem {
  description: string;
  quantity: number;
  unitOfMeasurement: string;
  baseRate: number;
  taxRate: number;
  totalAmount?: number;  // Calculated field
}

export interface EMDDocument {
  key: string;         // S3 key
  fileName: string;    // Original file name
  uploadedAt: Date;
  url?: string;        // Presigned URL when needed
}

export interface EMDDetails {
  amount: number;
  paymentMode: EMDPaymentMode;
  submissionDate: Date;
  bankName: string;    // Default: 'IDBI'
  document?: EMDDocument;
}

export interface ApprovalLevel {
  level: number;
  userId: string;
  user?: User;         // Populated when needed
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  timestamp?: Date;
}

export interface RejectionRecord {
  level: number;
  rejectedBy: string;
  rejectedAt: Date;
  remarks: string;
  previousStatus: BudgetaryOfferStatus;
}

export interface BudgetaryOffer {
  id: string;
  offerId: string;
  offerDate: Date;
  fromAuthority: string;
  toAuthority: string;
  rejectionHistory?: RejectionRecord[];
  subject: string;
  workItems: WorkItem[];
  emdDetails: EMDDetails;
  termsAndConditions: string;
  status: BudgetaryOfferStatus;
  approvalLevels: ApprovalLevel[];
  currentApprovalLevel?: number;
  createdById: string;
  createdBy?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetaryOfferCreateInput {
  offerId: string;
  offerDate: Date;
  fromAuthority: string;
  toAuthority: string;
  status: BudgetaryOfferStatus;
  subject: string;
  workItems: Omit<WorkItem, 'totalAmount'>[];
  emdDetails: Omit<EMDDetails, 'document'>;
  termsAndConditions: {
    html: string;       // Store the HTML content
    plainText?: string; // Optional plain text for search/display
  };
  currentApprovalLevel?: number;
  approvalLevels: ApprovalLevel[];
  approvers: string[];  // Array of user IDs for approval chain
  createdById: string;
}

export interface BudgetaryOfferUpdateInput extends Partial<BudgetaryOfferCreateInput> {
  emdDocument?: Express.Multer.File;  // For document uploads
}

export interface BudgetaryOfferFilters {
  status?: BudgetaryOfferStatus;
  fromDate?: Date;
  toDate?: Date;
  createdById?: string;
  pendingApprovalFor?: string;  // User ID to filter offers pending their approval
}

export interface BudgetaryOfferStatistics {
  totalOffers: number;
  totalValue: number;
  totalEMDValue: number;
  byStatus: Record<BudgetaryOfferStatus, number>;
  monthlyTrends: Array<{
    month: string;
    count: number;
    value: number;
  }>;
  approvalMetrics: {
    averageApprovalTime: number;  // in hours
    pendingApprovals: number;
  };
}

// API response types
export interface BudgetaryOfferResponse {
  success: boolean;
  data?: BudgetaryOffer;
  error?: string;
  message?: string;
}

export interface BudgetaryOfferListResponse {
  success: boolean;
  data?: {
    offers: BudgetaryOffer[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}