export interface DeliveryPeriod {
    start: string;
    end: string;
}

export interface CreateLoaDto {
    loaNumber: string;
    loaValue: number;
    deliveryPeriod: DeliveryPeriod;
    workDescription: string;
    documentFile?: Express.Multer.File;
    tags?: string[];
    siteId: string;
    hasEmd?: boolean;
    emdAmount?: number;
    hasSecurityDeposit?: boolean;
    securityDepositAmount?: number;
    securityDepositFile?: Express.Multer.File;
    hasPerformanceGuarantee?: boolean;
    performanceGuaranteeAmount?: number;
    performanceGuaranteeFile?: Express.Multer.File;
}
