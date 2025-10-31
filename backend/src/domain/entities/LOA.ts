export interface LOA {
    purchaseOrders: any;
    id: string;
    loaNumber: string;
    loaValue: number;
    deliveryPeriod: {
        start: Date;
        end: Date;
    };
    dueDate?: Date;
    orderReceivedDate?: Date;
    status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
    site: {
        id: string;
        name: string;
        code: string;
        zoneId: string;
    };
    siteId: string;
    workDescription: string;
    documentUrl: string;
    amendments?: Amendment[];
    invoices?: any[]; // Invoice records for billing
    remarks?: string;
    tenderNo?: string;
    orderPOC?: string;
    fdBgDetails?: string;
    hasEmd: boolean;
    emdAmount?: number;
    hasSecurityDeposit: boolean;
    securityDepositAmount?: number;
    securityDepositDocumentUrl?: string;
    hasPerformanceGuarantee: boolean;
    performanceGuaranteeAmount?: number;
    performanceGuaranteeDocumentUrl?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Amendment {
    id: string;
    amendmentNumber: string;
    documentUrl: string;
    loaId: string;
    loa?: LOA;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}