import { TenderStatus } from "@prisma/client";

export interface UpdateTenderDto {
  tenderNumber?: string;
  dueDate?: Date | string;
  description?: string;
  hasEMD?: boolean | string;
  emdAmount?: number | string | null;
  status?: TenderStatus;
  documentFile?: Express.Multer.File;
  nitDocumentFile?: Express.Multer.File;
  tags?: string[];
} 