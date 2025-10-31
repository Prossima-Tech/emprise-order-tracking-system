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
  dueDate: z.date().optional().nullable(),
  orderReceivedDate: z.date().optional().nullable(),
  workDescription: z.string().min(1, 'Work description is required'),
  tags: z.array(z.string()),
  documentFile: z.any().refine((val) => !!val, { message: 'Document file is required' }), // File is required
  emdId: z.string().optional(), // EMD ID field
  siteId: z.string().min(1, 'Site is required'), // Add site field
  remarks: z.string().optional(),
  tenderNo: z.string().optional(),
  orderPOC: z.string().optional(),
  fdBgDetails: z.string().optional(),
  hasEmd: z.boolean().default(false),
  emdAmount: z.number().optional().nullable(),
  hasSecurityDeposit: z.boolean().default(false),
  securityDepositAmount: z.number().optional().nullable(),
  securityDepositFile: z.any().optional(),
  hasPerformanceGuarantee: z.boolean().default(false),
  performanceGuaranteeAmount: z.number().optional().nullable(),
  performanceGuaranteeFile: z.any().optional(),
  // Warranty period fields
  warrantyPeriodMonths: z.number().min(0).optional().nullable(),
  warrantyPeriodYears: z.number().min(0).optional().nullable(),
  warrantyStartDate: z.date().optional().nullable(),
  warrantyEndDate: z.date().optional().nullable(),
  // Billing/Invoice fields
  invoiceNumber: z.string().optional(),
  invoiceAmount: z.number().optional().nullable(),
  totalReceivables: z.number().optional().nullable(),
  actualAmountReceived: z.number().optional().nullable(),
  amountDeducted: z.number().optional().nullable(),
  amountPending: z.number().optional().nullable(),
  deductionReason: z.string().optional(),
  billLinks: z.string().optional(),
  invoicePdfFile: z.any().optional(),
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
export interface LOA extends Omit<LOAFormData, 'documentFile' | 'securityDepositFile' | 'performanceGuaranteeFile' | 'invoicePdfFile'> {
  id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUPPLY_WORK_COMPLETED' | 'CHASE_PAYMENT' | 'CLOSED';
  documentUrl?: string;
  securityDepositDocumentUrl?: string;
  performanceGuaranteeDocumentUrl?: string;
  amendments: Amendment[];
  purchaseOrders: PurchaseOrder[];
  invoices?: Invoice[];
  daysToDueDateFromExcel?: number | null;  // Days to due date from Excel (negative=overdue, positive=remaining, null=completed)
  site: {
    id: string;
    name: string;
    location: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface for Invoice/Billing data
export interface Invoice {
  id: string;
  loaId: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  totalReceivables?: number;
  actualAmountReceived?: number;
  amountDeducted?: number;
  amountPending?: number;
  deductionReason?: string;
  billLinks?: string;
  invoicePdfUrl?: string;
  remarks?: string;
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