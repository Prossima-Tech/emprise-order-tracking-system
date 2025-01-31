import { Item } from "./Item";
import { Vendor } from "./Vendor";

export interface VendorItem {
    vendor: Vendor;
    vendorId: string;
    item: Item;
    itemId: string;
    unitPrice: number;  // Vendor specific price
    createdAt: Date;
    updatedAt: Date;
  }