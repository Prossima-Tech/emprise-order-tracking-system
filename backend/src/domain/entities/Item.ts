import { PurchaseOrderItem } from "./PurchaseOrderItem";
import { VendorItem } from "./VendorItem";

// export interface TaxRates {
//     igst?: number;
//     sgst?: number;
//     ugst?: number;
//   }
  
  export interface Item {
    id: string;
    name: string;
    description?: string;
    unitPrice: number;
    uom: string;  // Unit of Measurement
    hsnCode?: string;
    // taxRates: TaxRates;
    vendors?: VendorItem[];
    poItems?: PurchaseOrderItem[];
    createdAt: Date;
    updatedAt: Date;
  }

  export interface PriceHistoryEntry {
    purchaseDate: Date;
    poNumber: string;
    quantity: number;
    unitPrice: number;
    status: string;
}

export interface PriceHistoryData {
    currentPrice: number;
    priceHistory: PriceHistoryEntry[];
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
}
  