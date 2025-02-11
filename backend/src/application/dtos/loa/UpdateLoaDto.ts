import { DeliveryPeriod } from "./CreateLoaDto";

export interface UpdateLoaDto {
    loaNumber?: string;
    loaValue?: number;
    deliveryPeriod?: DeliveryPeriod;
    workDescription?: string;
    documentFile?: Express.Multer.File;
    tags?: string[];
    emdId?: string;
}