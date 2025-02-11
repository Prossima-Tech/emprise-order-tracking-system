// application/dtos/purchaseOrder/PurchaseOrderDto.ts
import { ApprovalActionType, POStatus } from '../../../domain/entities/constants';

export interface PurchaseOrderItemDto {
  itemId: string;
  quantity: number;
  unitPrice: number;  
  // taxRate: number;
  totalAmount?: number; 
}

export interface SubmitForApprovalDto {
  comments?: string;
}

export interface ApproveOrderDto {
  comments?: string;
}

export interface RejectOrderDto {
  reason: string;
}

export interface CreatePurchaseOrderDto {
  loaId: string;
  vendorId: string;
  items: PurchaseOrderItemDto[];
  baseAmount?: number;
  taxAmount: number;
  totalAmount?: number;
  requirementDesc: string;
  termsConditions: string;
  shipToAddress: string;
  notes?: string;
  documentFile?: Express.Multer.File;
  tags?: string[];
  approverId?: string;
}

export interface UpdatePurchaseOrderDto {
  requirementDesc?: string;
  termsConditions?: string;
  shipToAddress?: string;
  notes?: string;
  documentFile?: Express.Multer.File;
  tags?: string[];
  baseAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  approverId?: string;
  status?: POStatus;
  regeneratePdf?: boolean;
  approvalNotes?: string;
  rejectionReason?: string;
}

export interface PurchaseOrderResponseDto {
  id: string;
  poNumber: string;
  loa: {
    id: string;
    loaNumber: string;
    loaValue: number;
  };
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    item: {
      id: string;
      name: string;
      description?: string;
    };
    quantity: number;
    unitPrice: number;
    taxRate: number;
    totalAmount: number;
  }>;

  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  requirementDesc: string;
  termsConditions: string;
  shipToAddress: string;
  notes?: string;
  documentUrl?: string;
  documentHash?: string;
  status: POStatus;
  createdBy: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    name: string;
  };
  tags: string[];
  approvalComments?: string;
  rejectionReason?: string;
  approvalHistory: Array<{
    actionType: ApprovalActionType;
    userId: string;
    timestamp: string;
    comments?: string;
    previousStatus: POStatus;
    newStatus: POStatus;
  }>;
  createdAt: Date;
  updatedAt: Date;
}