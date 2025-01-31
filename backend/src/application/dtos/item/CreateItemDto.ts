// application/dtos/item/CreateItemDto.ts
export interface TaxRates {
    igst?: number;
    sgst?: number;
    ugst?: number;
}

export interface CreateItemDto {
    name: string;
    description?: string;
    unitPrice: number;
    uom: string;    // Unit of Measurement
    hsnCode?: string;
    taxRates: TaxRates;
}

export interface UpdateItemDto extends Partial<CreateItemDto> { }