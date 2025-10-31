import { TenderStatus } from "@prisma/client";

export interface Tender {
  id: string;
  tenderNumber: string;
  dueDate: Date;
  description: string;
  hasEMD: boolean;
  emdAmount?: number;
  status: TenderStatus;
  documentUrl?: string;
  nitDocumentUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
} 