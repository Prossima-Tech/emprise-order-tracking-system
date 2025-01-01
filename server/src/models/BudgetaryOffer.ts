// src/models/BudgetaryOffer.ts
import prisma from '../config/database';
import { 
  BudgetaryOffer, 
  BudgetaryOfferStatus,
  BudgetaryOfferCreateInput,
  BudgetaryOfferUpdateInput 
} from '../types';
import { Decimal } from '@prisma/client/runtime/library';

export class BudgetaryOfferModel {
  static async create(data: BudgetaryOfferCreateInput) {
    return prisma.budgetaryOffer.create({
      data: {
        tenderNo: data.tenderNo,
        amount: new Decimal(data.amount.toString()),
        emdAmount: new Decimal(data.emdAmount.toString()),
        dueDate: new Date(data.dueDate),
        status: BudgetaryOfferStatus.DRAFT,
        createdById: data.createdById
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  static async findById(id: string) {
    return prisma.budgetaryOffer.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        emdTrackings: true,
        loas: {
          include: {
            amendments: true
          }
        }
      }
    });
  }

  static async updateStatus(id: string, status: BudgetaryOfferStatus) {
    return prisma.budgetaryOffer.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
  }

  static async findAll(filters: any = {}, skip?: number, limit?: number) {
    return prisma.budgetaryOffer.findMany({
      where: filters,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        emdTrackings: {
          select: {
            status: true,
            amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
  }

  static async count(filters: any = {}): Promise<number> {
    return prisma.budgetaryOffer.count({
      where: filters
    });
  }

  static async update(id: string, data: BudgetaryOfferUpdateInput) {
    const updateData: any = {};
    
    if (data.tenderNo) updateData.tenderNo = data.tenderNo;
    if (data.amount) updateData.amount = new Decimal(data.amount.toString());
    if (data.emdAmount) updateData.emdAmount = new Decimal(data.emdAmount.toString());
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    
    return prisma.budgetaryOffer.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }
}