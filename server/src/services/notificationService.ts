// src/services/notificationService.ts
import { PurchaseOrder } from '../types/po.types';

export class NotificationService {
  static async notifyPOCreated(po: PurchaseOrder): Promise<void> {
    // Implement your notification logic
    console.log(`PO Created: ${po.poNumber}`);
  }

  static async notifyPOStatusUpdate(po: PurchaseOrder): Promise<void> {
    // Implement your notification logic
    console.log(`PO Status Updated: ${po.poNumber} - ${po.status}`);
  }
}