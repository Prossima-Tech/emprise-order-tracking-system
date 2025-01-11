// src/types/BudgetaryOffer.ts

export enum BudgetaryOfferStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
  }
  
  export interface WorkItem {
    description: string;
    quantity: number;
    unitOfMeasurement: string;
    baseRate: number;
    taxRate: number;
    totalAmount?: number;
  }
  
  export interface EMDDetails {
    amount: number;
    submissionDate: Date;
    bankName: string;
    paymentMode: string;
    document?: {
      key: string;
      fileName: string;
    };
  }
  
  export interface ApprovalLevel {
    level: number;
    approverId: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    remarks?: string;
    actionDate?: Date;
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
      html: string;
      plainText?: string;
    };
    currentApprovalLevel?: number;
    approvalLevels: ApprovalLevel[];
    approvers: string[];
    createdById: string;
  }
  
  export interface BudgetaryOffer extends BudgetaryOfferCreateInput {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  }