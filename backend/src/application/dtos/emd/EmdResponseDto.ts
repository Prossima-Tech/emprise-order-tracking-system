// application/dtos/emd/EmdResponseDto.ts
import { EMDStatus } from '@prisma/client';

export interface EmdResponseDto {
  id: string;
  amount: number;
  paymentMode: string;
  submissionDate: string | Date;
  maturityDate: string | Date;
  bankName: string;
  documentUrl?: string | null;
  extractedData?: {
    amount: number | null;
    bankName: string | null;
    maturityDate: string | null;
    submissionDate: string | null;
    extractedText: string;
  } | null;
  status: EMDStatus;

  // Relations
  offerId?: string | null;
  loaId?: string | null;
  tenderId?: string | null;

  // Populated relations (optional)
  offer?: {
    id: string;
    offerId: string;
    subject: string;
  };
  loa?: {
    id: string;
    loaNumber: string;
    loaValue: number;
  };
  tender?: {
    id: string;
    tenderNumber: string;
    description: string;
  };

  tags: string[];
  createdAt: string | Date;
  updatedAt: string | Date;

  // Computed fields
  daysUntilExpiry?: number;
  isExpired?: boolean;
}
