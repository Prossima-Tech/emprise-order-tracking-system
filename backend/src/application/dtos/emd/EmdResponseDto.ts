import { EMDStatus } from "../../../domain/entities/EMD";

export interface EmdResponseDto {
  id: string;
  amount: number;
  paymentMode: string;
  submissionDate: Date;
  maturityDate: Date;
  bankName: string;
  documentUrl: string;
  extractedData?: any;
  status: EMDStatus;
  offer?: {
    id: string;
    offerId: string;
    subject: string;
  };
  offerId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}