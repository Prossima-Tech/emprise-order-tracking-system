export interface CreateVendorItemDto {
    vendorId: string;
    itemId: string;
    unitPrice: number;
}

export interface UpdateVendorItemDto {
    unitPrice: number;
}