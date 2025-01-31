import { PurchaseOrderItem } from "./PurchaseOrderItem";
import { VendorItem } from "./VendorItem";

export interface TaxRates {
    igst?: number;
    sgst?: number;
    ugst?: number;
  }
  
  export interface Item {
    id: string;
    name: string;
    description?: string;
    unitPrice: number;
    uom: string;  // Unit of Measurement
    hsnCode?: string;
    taxRates: TaxRates;
    vendors?: VendorItem[];
    poItems?: PurchaseOrderItem[];
    createdAt: Date;
    updatedAt: Date;
  }
  