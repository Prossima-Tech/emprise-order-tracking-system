import { DeliveryPeriod } from "./CreateLoaDto";

export interface UpdateLoaDto {
    loaNumber?: string;
    loaValue?: number;
    deliveryPeriod?: DeliveryPeriod;
    dueDate?: string;
    orderReceivedDate?: string;
    workDescription?: string;
    documentFile?: Express.Multer.File;
    tags?: string[];
    siteId?: string;
    remarks?: string;
    tenderNo?: string;
    orderPOC?: string;
    fdBgDetails?: string;
    // New fields for EMD
    hasEmd?: boolean;
    emdAmount?: number;
    // New fields for security deposit
    hasSecurityDeposit?: boolean;
    securityDepositAmount?: number;
    securityDepositFile?: Express.Multer.File;
    // New fields for performance guarantee
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
}