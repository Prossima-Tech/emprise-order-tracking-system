export interface LOA {
    purchaseOrders: any;
    id: string;
    loaNumber: string;
    loaValue: number;
    deliveryPeriod: {
        start: Date;
        end: Date;
    };
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
    emd?: any;
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