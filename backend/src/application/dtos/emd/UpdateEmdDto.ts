import { EMDStatus } from '@prisma/client';

export interface UpdateEmdDto {
  amount?: number;
  submissionDate?: string;
  maturityDate?: string;
  bankName?: string;
  documentFile?: Express.Multer.File;
  status?: EMDStatus;
  offerId?: string;
  tags?: string[];
}