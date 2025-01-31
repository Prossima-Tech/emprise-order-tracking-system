import { z } from "zod";

export const workItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unitOfMeasurement: z.string().min(1, "Unit of measurement is required"),
  baseRate: z.number().min(0, "Base rate must be positive"),
  taxRate: z.number().min(0, "Tax rate must be positive")
});

export const offerSchema = z.object({
  offerDate: z.date(),
  toAuthority: z.string().min(1, "Authority is required"),
  subject: z.string().min(1, "Subject is required"),
  workItems: z.array(workItemSchema).min(1, "At least one work item is required"),
  termsConditions: z.string(),
  tags: z.array(z.string()),
  approverId: z.string().min(1, "Approver is required")
});

// export type WorkItem = z.infer<typeof workItemSchema>;
// export type OfferFormData = z.infer<typeof offerSchema>;

export interface Offer extends OfferFormData {
  id: string;
  documentUrl?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvalDate: any;
  approvalComments: any;
  approvalHistory: boolean;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
}

export interface WorkItem {
  description: string;
  quantity: number;
  unitOfMeasurement: string;
  baseRate: number;
  taxRate: number;
}

export interface OfferFormData {
  offerDate: Date;
  toAuthority: string;
  subject: string;
  workItems: WorkItem[];
  termsConditions: string;
  tags: string[];
  approverId: string;
}
