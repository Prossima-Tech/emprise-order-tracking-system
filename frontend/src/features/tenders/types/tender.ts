import { z } from 'zod';

export const tenderSchema = z.object({
  tenderNumber: z.string().min(1, 'Tender number is required'),
  dueDate: z.date(),
  description: z.string().min(1, 'Description is required'),
  hasEMD: z.boolean().default(false),
  emdAmount: z.number().min(0, 'EMD amount must be positive').optional().nullable(),
  tags: z.array(z.string()).default([]),
  documentFile: z.any().optional(), // We'll handle file validation separately
  nitDocumentFile: z.any().optional() // We'll handle file validation separately
});

export type TenderFormData = z.infer<typeof tenderSchema>;

export type TenderStatus = 'ACTIVE' | 'RETENDERED' | 'CANCELLED' | 'AWARDED' | 'NOT_AWARDED';

export interface Tender {
  id: string;
  tenderNumber: string;
  dueDate: string;
  description: string;
  hasEMD: boolean;
  emdAmount?: number | null;
  status: TenderStatus;
  documentUrl?: string;
  nitDocumentUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TenderResponse {
  status: string;
  data: {
    data: Tender[];
    total: number;
  } | Tender | Tender[];
} 