
export class UpdateBudgetaryOfferDto {
  offerDate?: string;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  documentUrl?: string;
  documentHash?: string;
  tags?: any;
  toAuthority?: string;
  subject?: string;
  workItems?: Array<{
    description: string;
    quantity: number;
    unit: string;
    rate: number;
  }>;
  termsConditions?: string;
  approverId?: string;
}
