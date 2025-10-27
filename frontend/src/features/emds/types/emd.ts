import { z } from 'zod';

export const emdSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  submissionDate: z.date(),
  maturityDate: z.date(),
  bankName: z.string().min(1, 'Bank name is required'),
  offerId: z.string().optional(),
  loaId: z.string().optional(),
  tenderId: z.string().optional(),
  tags: z.array(z.string()),
  documentFile: z.any().optional() // We'll handle file validation separately
});

export type EMDFormData = z.infer<typeof emdSchema>;

export interface EMD {
  id: string;
  amount: number;
  paymentMode: string;
  submissionDate: string;
  maturityDate: string;
  bankName: string;
  documentUrl?: string;
  extractedData?: {
    amount: number | null;
    bankName: string | null;
    maturityDate: string | null;
    submissionDate: string | null;
    extractedText: string;
  };
  status: 'ACTIVE' | 'EXPIRED' | 'RELEASED';
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

export interface EMDResponse {
  status: string;
  data: {
    data?: EMD[];
    total?: number;
  } | EMD;
}
