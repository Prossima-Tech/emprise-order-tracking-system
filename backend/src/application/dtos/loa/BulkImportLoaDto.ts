export interface BulkImportLoaDto {
  file: Express.Multer.File;
}

export interface LOAImportRow {
  loaNumber: string;
  site: string;
  orderValue: number;
  workDescription: string;
  orderReceivedDate?: Date;
  deliveryDate?: Date;
  orderDueDate?: Date;
  orderStatus?: string;
  emd?: number;
  securityDeposit?: number;
  // Billing fields
  lastInvoiceNo?: string;
  lastInvoiceAmount?: number;
  totalReceivables?: number;
  actualAmountReceived?: number;
  amountDeducted?: number;
  amountPending?: number;
  reasonForDeduction?: string;
  billLinks?: string;
  remarks?: string;
}

export interface BulkImportResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  errors: Array<{
    row: number;
    loaNumber: string;
    error: string;
  }>;
  createdLoas: Array<{
    loaNumber: string;
    loaValue: number;
    site: string;
  }>;
}
