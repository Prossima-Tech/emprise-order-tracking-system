// application/dtos/fdr/BulkImportFdrDto.ts

/**
 * FDR Import Row - Matches Excel sheet structure
 * Columns: Category, Bank, Account No., FD/BG No., Account Name, Deposit Amount,
 * Date of Deposit, Maturity Value, Contract No., Contract Details, POC, Location, EMD, SD, Status
 */
export interface FDRImportRow {
  category: string;                  // FD or BG
  bank: string;                      // Bank name
  accountNo?: string;                // Account number
  fdrNumber?: string;                // FD/BG number
  accountName?: string;              // Account holder name
  depositAmount: number;             // Deposit amount
  dateOfDeposit?: Date;              // Date of deposit
  maturityValue?: number;            // Maturity value
  contractNo?: string;               // Contract/PO number
  contractDetails?: string;          // Description of work
  poc?: string;                      // Point of contact
  location?: string;                 // Location/site
  emd?: number;                      // EMD amount
  sd?: number;                       // Security Deposit amount
  status?: string;                   // Status (Running, Completed, etc.)
}

/**
 * Bulk import result
 */
export interface BulkImportFdrResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  errors: Array<{
    row: number;
    fdrNumber: string;
    error: string;
  }>;
  createdFdrs: Array<{
    fdrNumber?: string;
    depositAmount: number;
    bankName: string;
    location?: string;
  }>;
}
