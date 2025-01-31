import { z } from 'zod';

// We first define the schema for individual line items in a purchase order
const purchaseOrderItemSchema = z.object({
  itemId: z.string().min(1, 'Item selection is required'),
  quantity: z.number()
    .min(1, 'Quantity must be a positive number'),
  unitPrice: z.number()
    .min(0, 'Unit price must be non-negative'),
  taxRates: z.object({
    igst: z.number(),
    sgst: z.number(),
    ugst: z.number()
  }),
  // We'll calculate these values on the server but include them in the type
  subtotal: z.number().optional(),
  taxes: z.number().optional(),
  total: z.number().optional(),
});

// Main purchase order schema
export const purchaseOrderSchema = z.object({
  loaId: z.string().min(1, 'LOA reference is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  items: z.array(purchaseOrderItemSchema)
    .min(1, 'At least one item is required'),
  requirementDesc: z.string()
    .min(10, 'Requirement description must be at least 10 characters')
    .max(1000, 'Requirement description must not exceed 1000 characters')
    .trim(),
  termsConditions: z.string()
    .min(10, 'Terms and conditions must be at least 10 characters')
    .max(2000, 'Terms and conditions must not exceed 2000 characters')
    .trim(),
  shipToAddress: z.string()
    .min(10, 'Shipping address must be at least 10 characters')
    .max(500, 'Shipping address must not exceed 500 characters')
    .trim(),
  notes: z.string().optional(),
  approverId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// Types derived from schemas
export type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

// Extended types for API responses
export interface PurchaseOrder extends Omit<PurchaseOrderFormData, 'items'> {
  id: string;
  poNumber: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  documentUrl: string | null;
  items: (PurchaseOrderItem & {
    item: {
      taxRates: any;
      taxRate: number;
      id: string;
      name: string;
      description: string;
      uom: string;
    };
  })[];
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  loa: {
    id: string;
    loaNumber: string;
    documentUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
}