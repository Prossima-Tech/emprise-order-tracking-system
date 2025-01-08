export enum BudgetaryOfferStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface WorkItem {
  description: string;
  basicRate: number;
  unit: string;
  taxRate: number;
}

export interface EMDDetails {
  amount: number;
  paymentMode: 'DD' | 'BG' | 'ONLINE' | 'CASH';
  validityPeriod?: number;
  remarks?: string;
}

export interface BudgetaryOfferCreateInput {
  fromAuthority: string;
  toAuthority: string;
  subject: string;
  workItems: WorkItem[];
  emdDetails: EMDDetails;
  termsAndConditions: string;
}

export interface BudgetaryOfferUpdateInput {
  fromAuthority?: string;
  toAuthority?: string;
  subject?: string;
  workItems?: WorkItem[];
  emdDetails?: EMDDetails;
  termsAndConditions?: string;
}

export interface BudgetaryOffer {
  id: string;
  fromAuthority: string;
  toAuthority: string;
  subject: string;
  workItems: WorkItem[];
  emdDetails: EMDDetails;
  termsAndConditions: string;
  status: BudgetaryOfferStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
