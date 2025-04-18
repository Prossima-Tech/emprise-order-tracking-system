import { DeliveryPeriod } from "./CreateLoaDto";

export interface UpdateLoaDto {
    loaNumber?: string;
    loaValue?: number;
    deliveryPeriod?: DeliveryPeriod;
    workDescription?: string;
    documentFile?: Express.Multer.File;
    tags?: string[];
    siteId?: string;
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
}