import { z } from 'zod';

export const fdrSchema = z.object({
  category: z.enum(['FD', 'BG']).default('FD'),
  bankName: z.string().min(1, 'Bank name is required').default('IDBI'),
  accountNo: z.string().optional(),
  fdrNumber: z.string().optional(),
  accountName: z.string().optional(),
  depositAmount: z.number().min(0, 'Deposit amount must be positive'),
  dateOfDeposit: z.date(),
  maturityValue: z.number().optional(),
  maturityDate: z.date().optional(),
  contractNo: z.string().optional(),
  contractDetails: z.string().optional(),
  poc: z.string().optional(),
  location: z.string().optional(),
  emdAmount: z.number().optional(),
  sdAmount: z.number().optional(),
  status: z.enum(['RUNNING', 'COMPLETED', 'CANCELLED', 'RETURNED']).optional(),
  offerId: z.string().optional(),
  loaId: z.string().optional(),
  tenderId: z.string().optional(),
  tags: z.array(z.string()).default(['FD']),
  documentFile: z.any().optional() // We'll handle file validation separately
});

export type FDRFormData = z.infer<typeof fdrSchema>;

export interface FDR {
  id: string;

  // Basic FDR/BG Information
  category: 'FD' | 'BG';
  bankName: string;
  accountNo?: string;
  fdrNumber?: string;
  accountName?: string;

  // Financial Details
  depositAmount: number;
  dateOfDeposit: string;
  maturityValue?: number;
  maturityDate?: string;

  // Contract/Project Information
  contractNo?: string;
  contractDetails?: string;
  poc?: string;
  location?: string;

  // Deposit Usage
  emdAmount?: number;
  sdAmount?: number;

  // Document
  documentUrl?: string;
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

  // Status
  status: 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';

  // Relations
  offer?: {
    id: string;
    offerId: string;
    subject: string;
  };
  offerId?: string;

  tender?: {
    id: string;
    tenderNumber: string;
    description: string;
  };
  tenderId?: string;

  loa?: {
    id: string;
    loaNumber: string;
  };
  loaId?: string;

  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FDRResponse {
  status: string;
  data: {
    data?: FDR[];
    total?: number;
  } | FDR;
}

export interface BulkImportFDRResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  errors: Array<{
    row: number;
    fdrNumber: string;
    error: string;
  }>;
  createdFdrs: Array<{
    fdrNumber?: string;
    depositAmount: number;
    bankName: string;
    location?: string;
  }>;
}
