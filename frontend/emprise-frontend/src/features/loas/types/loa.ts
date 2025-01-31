import { z } from 'zod';

// Define the schema for the delivery period
const deliveryPeriodSchema = z.object({
  start: z.date(),
  end: z.date(),
});

// Schema for creating or updating an LOA
export const loaSchema = z.object({
  loaNumber: z.string().min(1, 'LOA number is required'),
  loaValue: z.number().min(0, 'LOA value must be positive'),
  deliveryPeriod: deliveryPeriodSchema,
  workDescription: z.string().min(1, 'Work description is required'),
  tags: z.array(z.string()),
  documentFile: z.any().optional(), // File validation handled separately
});

// Schema for creating an amendment
export const amendmentSchema = z.object({
  amendmentNumber: z.string().min(1, 'Amendment number is required'),
  documentFile: z.any().optional(),
  tags: z.array(z.string()),
});

// Types derived from schemas
export type DeliveryPeriod = z.infer<typeof deliveryPeriodSchema>;
export type LOAFormData = z.infer<typeof loaSchema>;
export type AmendmentFormData = z.infer<typeof amendmentSchema>;

// Interface for Purchase Order
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  value: number;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for LOA with additional properties
export interface LOA extends Omit<LOAFormData, 'documentFile'> {
  id: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  documentUrl?: string;
  amendments: Amendment[];
  purchaseOrders: PurchaseOrder[];
  createdAt: string;
  updatedAt: string;
}

// Interface for Amendment with additional properties
export interface Amendment extends Omit<AmendmentFormData, 'documentFile'> {
  id: string;
  loaId: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
  loa?: LOA;
}