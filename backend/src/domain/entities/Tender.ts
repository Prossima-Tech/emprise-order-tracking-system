import { TenderStatus } from "./constants";

export interface Tender {
  id: string;
  tenderNumber: string;
  dueDate: Date;
  description: string;
  hasEMD: boolean;
  emdAmount?: number;
  status: TenderStatus;
  documentUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
} 