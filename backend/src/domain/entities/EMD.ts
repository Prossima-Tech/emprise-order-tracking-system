import { BudgetaryOffer } from './BudgetaryOffer';
export enum EMDStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  RELEASED = 'RELEASED'
}

export interface EMD {
  id: string;
  amount: number;
  paymentMode: string;
  submissionDate: Date;
  maturityDate: Date;
  bankName: string;
  documentUrl: string;
  extractedData?: any;
  status: EMDStatus;
  loa?: {
    id: string;
    loaNumber: string;
    loaValue: number;
  };
  offer?: BudgetaryOffer;
  offerId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}