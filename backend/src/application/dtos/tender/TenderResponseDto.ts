import { TenderStatus } from "../../../domain/entities/constants";

export interface TenderResponseDto {
  id: string;
  tenderNumber: string;
  dueDate: Date;
  description: string;
  hasEMD: boolean;
  emdAmount?: number | null;
  status: TenderStatus;
  documentUrl?: string;
  nitDocumentUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
} 