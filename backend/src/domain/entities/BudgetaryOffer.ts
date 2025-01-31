import { EmailLog } from "./EmailLog";

export interface WorkItem {
  description: string;
  quantity: number;
  unitOfMeasurement: string;
  baseRate: number;
  taxRate: number;
}

export interface BudgetaryOffer {
  tags: any;
  id?: string;
  offerId: string;
  offerDate: Date;
  toAuthority: string;
  subject: string;
  workItems: WorkItem[];
  termsConditions: string;
  documentUrl: string;
  documentHash: string;
  emailLogs?: EmailLog[];
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdById: string;
  approverId?: string;
  approvalComments?: string;
  approvalDate?: Date;
  approvalHistory: ApprovalAction[];
}

export interface ApprovalAction {
  actionType: 'SUBMIT' | 'APPROVE' | 'REJECT';
  userId: string;
  timestamp: Date;
  comments?: string;
  previousStatus: string;
  newStatus: string;
}