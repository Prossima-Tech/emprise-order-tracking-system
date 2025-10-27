// application/dtos/emd/CreateEmdDto.ts

export interface CreateEmdDto {
  amount: number;
  paymentMode?: string; // FDR, Bank Guarantee, Cheque, etc.
  submissionDate: Date | string;
  maturityDate: Date | string;
  bankName?: string;
  documentFile?: Express.Multer.File;
  extractedData?: {
    amount: number | null;
    bankName: string | null;
    maturityDate: string | null;
    submissionDate: string | null;
    extractedText: string;
  };

  // Relations - EMD can be linked to Offer, LOA, or Tender
  offerId?: string;
  loaId?: string;
  tenderId?: string;

  tags?: string[] | string;
}
