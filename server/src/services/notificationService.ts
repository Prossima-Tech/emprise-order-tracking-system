// src/services/notificationService.ts
import { PurchaseOrder } from '../types/po.types';
import { BudgetaryOffer, ApprovalLevel } from '../types/budgetaryOffer';
import prisma from '../config/database';
// import { EmailService } from '../utils/email';
import { User } from '@prisma/client';

export class NotificationService {
  static async notifyPOCreated(po: PurchaseOrder): Promise<void> {
    // Implement your notification logic
    console.log(`PO Created: ${po.poNumber}`);
  }

  static async notifyPOStatusUpdate(po: PurchaseOrder): Promise<void> {
    // Implement your notification logic
    console.log(`PO Status Updated: ${po.poNumber} - ${po.status}`);
  }

  static async notifyApprovalRequired(
    offerId: string,
    currentLevel: number,
    approverId: string
  ): Promise<void> {
    // try {
    //   const [offer, approver] = await Promise.all([
    //     prisma.budgetaryOffer.findUnique({
    //       where: { id: offerId },
    //       include: { createdBy: true }
    //     }),
    //     prisma.user.findUnique({
    //       where: { id: approverId }
    //     })
    //   ]);

    //   if (!offer || !approver) return;

    //   // Send email notification
    //   await EmailService.sendMail({
    //     to: approver.email,
    //     subject: `Budgetary Offer Approval Required - ${offer.subject}`,
    //     template: 'approval-required',
    //     data: {
    //       approverName: approver.name,
    //       offerSubject: offer.subject,
    //       offerCreator: offer.createdBy.name,
    //       approvalLevel: currentLevel,
    //       approvalLink: `${process.env.FRONTEND_URL}/budgetary-offers/${offerId}/approve`
    //     }
    //   });

    //   // Store notification in database for in-app notifications
    //   await prisma.notification.create({
    //     data: {
    //       userId: approverId,
    //       type: 'APPROVAL_REQUIRED',
    //       title: 'Budgetary Offer Approval Required',
    //       message: `Your approval is required for BO: ${offer.subject}`,
    //       data: {
    //         offerId,
    //         level: currentLevel
    //       },
    //       isRead: false
    //     }
    //   });

    // } catch (error) {
    //   console.error('Failed to send approval notification:', error);
    // }
  }

  /**
   * Send notification when BO is approved/rejected at any level
   */
  static async notifyApprovalStatus(
    offer: BudgetaryOffer,
    level: ApprovalLevel,
    isApproved: boolean
  ): Promise<void> {
    // try {
    //   // Notify the BO creator
    //   await EmailService.sendMail({
    //     to: offer.createdBy.email,
    //     subject: `Budgetary Offer ${isApproved ? 'Approved' : 'Rejected'} - ${offer.subject}`,
    //     template: isApproved ? 'offer-approved' : 'offer-rejected',
    //     data: {
    //       creatorName: offer.createdBy.name,
    //       offerSubject: offer.subject,
    //       approverName: level.user?.name,
    //       approvalLevel: level.level,
    //       remarks: level.remarks,
    //       offerLink: `${process.env.FRONTEND_URL}/budgetary-offers/${offer.id}`
    //     }
    //   });

    //   // If approved and there's a next level, notify the next approver
    //   if (isApproved && offer.currentApprovalLevel) {
    //     const nextLevel = offer.approvalLevels[offer.currentApprovalLevel];
    //     if (nextLevel) {
    //       await this.notifyApprovalRequired(
    //         offer.id,
    //         nextLevel.level,
    //         nextLevel.userId
    //       );
    //     }
    //   }

    //   // Store notifications for all stakeholders
    //   const notifications = [{
    //     userId: offer.createdById,
    //     type: isApproved ? 'OFFER_APPROVED' : 'OFFER_REJECTED',
    //     title: `Budgetary Offer ${isApproved ? 'Approved' : 'Rejected'}`,
    //     message: `BO ${offer.subject} was ${isApproved ? 'approved' : 'rejected'} by ${level.user?.name}`,
    //     data: {
    //       offerId: offer.id,
    //       level: level.level,
    //       remarks: level.remarks
    //     }
    //   }];

    //   await prisma.notification.createMany({
    //     data: notifications
    //   });

    // } catch (error) {
    //   console.error('Failed to send status notification:', error);
    // }
  }
}