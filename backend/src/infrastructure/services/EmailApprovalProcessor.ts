// infrastructure/services/EmailApprovalProcessor.ts

import { PurchaseOrderService } from "../../application/services/PurchaseOrderService";

export class EmailApprovalProcessor {
  
    async processIncomingEmail(params: {
      from: string;
      subject: string;
      poService: PurchaseOrderService;
    }): Promise<boolean> {
      const { from, subject, poService } = params;
  
      // Extract command and PO ID from subject
      const match = subject.match(/^(APPROVE|REJECT)\s+PO:([a-zA-Z0-9-]+)$/);
      if (!match) return false;
  
      const [, action, poId] = match;
      
      try {
        // Validate approver email
        const po = await poService.getPurchaseOrder(poId);
        if (!po.isSuccess || !po.data) {
          console.error('PO not found:', poId);
          return false;
        }
  
        const approver = po.data.approver;
        if (!approver || approver.email !== from) {
          console.error('Invalid approver email:', from);
          return false;
        }
  
        // Process approval/rejection
        if (action === 'APPROVE') {
          await poService.approveOrder(poId, approver.id);
        } else {
          await poService.rejectOrder(poId, approver.id, 'Rejected via email');
        }
  
        return true;
      } catch (error) {
        console.error('Error processing approval email:', error);
        return false;
      }
    }
  }