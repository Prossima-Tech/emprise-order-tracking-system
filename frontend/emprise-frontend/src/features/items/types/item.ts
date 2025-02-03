// src/features/items/types/item.ts
import { z } from 'zod';

export const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  uom: z.string().min(1, 'Unit of measurement is required'),
  hsnCode: z.string().min(1, 'HSN code is required'),
});

export type ItemFormData = z.infer<typeof itemSchema>;

export interface Item extends ItemFormData {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
  vendors: Array<{
    id: string;
    vendor: {
      id: string;
      name: string;
    };
    unitPrice: number;
    lastUpdated: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ItemVendor {
  id: string;
  vendor: {
    id: string;
    name: string;
  };
  unitPrice: number;
  lastUpdated: string;
}