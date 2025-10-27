export interface DeliveryPeriod {
    start: string;
    end: string;
}

export interface CreateLoaDto {
    loaNumber: string;
    loaValue: number;
    deliveryPeriod: DeliveryPeriod;
    dueDate?: string;
    orderReceivedDate?: string;
    workDescription: string;
    documentFile?: Express.Multer.File;
    tags?: string[];
    siteId: string;
    remarks2?: string;
    hasEmd?: boolean;
    emdAmount?: number;
    hasSecurityDeposit?: boolean;
    securityDepositAmount?: number;
    securityDepositFile?: Express.Multer.File;
    hasPerformanceGuarantee?: boolean;
    performanceGuaranteeAmount?: number;
    performanceGuaranteeFile?: Express.Multer.File;
    // Billing/Invoice fields
    invoiceNumber?: string;
    invoiceAmount?: number;
    totalReceivables?: number;
    actualAmountReceived?: number;
    amountDeducted?: number;
    amountPending?: number;
    deductionReason?: string;
    billLinks?: string;
    invoicePdfFile?: Express.Multer.File;
    remarks?: string;
}
