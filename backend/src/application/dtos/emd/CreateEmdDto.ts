export interface CreateEmdDto {
    amount: number;
    paymentMode?: string;  // Default to "FDR"
    submissionDate: string;
    maturityDate: string;
    bankName?: string;     // Default to "IDBI"
    documentFile?: Express.Multer.File;
    offerId?: string;      // Optional reference to BudgetaryOffer
    tags?: string[];
  }