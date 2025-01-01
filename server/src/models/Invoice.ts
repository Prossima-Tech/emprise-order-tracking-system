import prisma from '../config/database';
import { Invoice, InvoiceStatus } from '../types';

export class InvoiceModel {
  static async create(data: Partial<Invoice>) {
    return prisma.invoice.create({
      data: {
        poId: data.poId!,
        vendorId: data.vendorId!,
        invoiceNo: data.invoiceNo!,
        amount: data.amount!,
        status: InvoiceStatus.PENDING,
        dueDate: new Date(data.dueDate!)
      },
      include: {
        po: {
          include: {
            loa: true
          }
        },
        vendor: true
      }
    });
  }

  static async updateStatus(id: string, status: InvoiceStatus, p0?: { remarks: any; updatedById: string; }) {
    return prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidDate: status === InvoiceStatus.PAID ? new Date() : null,
        updatedAt: new Date()
      }
    });
  }

  static async findByPO(poId: string) {
    return prisma.invoice.findMany({
      where: { poId },
      include: {
        vendor: true
      }
    });
  }

  static async getAnalytics(filters: any = {}) {
    const invoices = await prisma.invoice.findMany({
      where: filters,
      include: {
        po: true,
        vendor: true
      }
    });

    return {
      totalAmount: invoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
      paidAmount: invoices
      .filter(inv => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + Number(inv.amount), 0),
      pendingCount: invoices.filter(inv => inv.status === InvoiceStatus.PENDING).length,
      overdueCount: invoices.filter(inv => 
      inv.status !== InvoiceStatus.PAID && 
      new Date(inv.dueDate) < new Date()
      ).length
    };
  }
}