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
    emdId?: string;
}
