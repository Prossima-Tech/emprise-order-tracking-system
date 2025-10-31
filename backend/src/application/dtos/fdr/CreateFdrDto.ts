// application/dtos/fdr/CreateFdrDto.ts

export interface CreateFdrDto {
  // Basic FDR/BG Information
  category?: 'FD' | 'BG';
  bankName?: string;
  accountNo?: string;
  fdrNumber?: string;
  accountName?: string;

  // Financial Details
  depositAmount: number;
  dateOfDeposit: Date | string;
  maturityValue?: number;
  maturityDate?: Date | string;

  // Contract/Project Information
  contractNo?: string;
  contractDetails?: string;
  poc?: string;
  location?: string;

  // Deposit Usage
  emdAmount?: number;
  sdAmount?: number;

  // Document
  documentFile?: Express.Multer.File;
  extractedData?: {
    depositAmount: number | null;
    bankName: string | null;
    maturityDate: string | null;
    dateOfDeposit: string | null;
    accountNo: string | null;
    fdrNumber: string | null;
    accountName: string | null;
    extractedText: string;
  };

  // Relations - FDR can be linked to Offer, LOA, or Tender
  offerId?: string;
  loaId?: string;
  tenderId?: string;

  // Status
  status?: 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';

  tags?: string[] | string;
}
