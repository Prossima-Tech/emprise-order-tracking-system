export enum BudgetaryOfferStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
  }
  
  export interface BudgetaryOffer {
    id: string;
    tenderNo: string;
    amount: number;
    emdAmount: number;
    dueDate: Date;
    status: BudgetaryOfferStatus;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface BudgetaryOfferCreateInput {
    tenderNo: string;
    amount: number;
    emdAmount: number;
    dueDate: Date | string;
  }