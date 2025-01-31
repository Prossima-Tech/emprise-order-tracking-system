import { Item, TaxRates } from "./Item";
import { PurchaseOrder } from "./PurchaseOrder";

export interface PurchaseOrderItem {
  id: string;
  purchaseOrder: PurchaseOrder;
  purchaseOrderId: string;
  item: Item;
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxRates: {
    igst?: number;
    sgst?: number;
    ugst?: number;
  };
  taxRate: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
