export interface BulkImportLoaDto {
  file: Express.Multer.File;
}

export interface LOAImportRow {
  loaNumber: string;
  site: string;
  customerName?: string;           // Customer name from Excel column
  orderValue: number;
  workDescription: string;
  orderReceivedDate?: Date;
  deliveryDate?: Date;
  orderDueDate?: Date;
  orderStatus?: string;
  emd?: number;
  securityDeposit?: number;
  performanceGuarantee?: number;   // Performance guarantee amount
  // Additional fields
  tenderNo?: string;               // Tender number
  orderPOC?: string;               // Point of contact
  fdBgDetails?: string;            // FD/BG details
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
  daysToDueDate?: string;          // Days to due date from Excel (can be "Completed", "(2,182)", or "5")
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
