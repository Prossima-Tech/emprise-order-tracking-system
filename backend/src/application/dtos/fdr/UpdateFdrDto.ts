// application/dtos/fdr/UpdateFdrDto.ts

export interface UpdateFdrDto {
  // Basic FDR/BG Information
  category?: 'FD' | 'BG';
  bankName?: string;
  accountNo?: string;
  fdrNumber?: string;
  accountName?: string;

  // Financial Details
  depositAmount?: number;
  dateOfDeposit?: Date | string;
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
  extractedData?: any;

  // Status
  status?: 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';

  // Relations
  offerId?: string;
  loaId?: string;
  tenderId?: string;

  tags?: string[] | string;
}
