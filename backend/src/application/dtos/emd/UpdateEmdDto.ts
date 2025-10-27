// application/dtos/emd/UpdateEmdDto.ts
import { EMDStatus } from '@prisma/client';

export interface UpdateEmdDto {
  amount?: number;
  paymentMode?: string;
  submissionDate?: Date | string;
  maturityDate?: Date | string;
  bankName?: string;
  documentFile?: Express.Multer.File;
  extractedData?: {
    amount: number | null;
    bankName: string | null;
    maturityDate: string | null;
    submissionDate: string | null;
    extractedText: string;
  };
  status?: EMDStatus;

  // Relations
  offerId?: string;
  loaId?: string;
  tenderId?: string;

  tags?: string[] | string;
}
