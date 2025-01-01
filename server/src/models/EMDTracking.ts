// src/models/EMDTracking.ts
import prisma from '../config/database';
import { EMDTracking, EMDStatus } from '../types';
import { Decimal } from '@prisma/client/runtime/library';

export class EMDTrackingModel {
  /**
   * Creates a new EMD tracking record
   */
  static async create(data: {
    offerId: string;
    amount: Decimal | number;
    dueDate: Date | string;
    documentPath?: string;
  }) {
    return prisma.eMDTracking.create({
      data: {
        offerId: data.offerId,
        amount: new Decimal(data.amount.toString()),
        dueDate: new Date(data.dueDate),
        status: EMDStatus.PENDING,
        documentPath: data.documentPath
      },
      include: {
        offer: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Finds EMD tracking record by ID
   */
  static async findById(id: string) {
    return prisma.eMDTracking.findUnique({
      where: { id },
      include: {
        offer: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Finds EMD tracking record by offer ID
   */
  static async findByOfferId(offerId: string) {
    return prisma.eMDTracking.findFirst({
      where: { offerId },
      include: {
        offer: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Updates EMD status and related fields
   */
  static async updateStatus(id: string, data: {
    status: EMDStatus;
    documentPath?: string;
  }) {
    const updateData: any = {
      status: data.status,
      updatedAt: new Date()
    };

    if (data.documentPath) {
      updateData.documentPath = data.documentPath;
    }

    // Set returnDate if status is RETURNED
    if (data.status === EMDStatus.RETURNED) {
      updateData.returnDate = new Date();
    }

    return prisma.eMDTracking.update({
      where: { id },
      data: updateData,
      include: {
        offer: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Finds all EMD tracking records with optional filters
   */
  static async findAll(filters?: {
    status?: EMDStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    }

    return prisma.eMDTracking.findMany({
      where,
      include: {
        offer: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Gets EMD statistics
   */
  static async getStatistics() {
    const allEMDs = await this.findAll();
    const today = new Date();

    const statistics = {
      total: allEMDs.length,
      totalAmount: allEMDs.reduce(
        (sum, emd) => sum.plus(emd.amount), 
        new Decimal(0)
      ),
      byStatus: {
        [EMDStatus.PENDING]: 0,
        [EMDStatus.SUBMITTED]: 0,
        [EMDStatus.RETURNED]: 0,
        [EMDStatus.FORFEITED]: 0
      },
      overdueCount: allEMDs.filter(emd => 
        emd.status === EMDStatus.PENDING && 
        new Date(emd.dueDate) < today
      ).length,
      returnedAmount: allEMDs
        .filter(emd => emd.status === EMDStatus.RETURNED)
        .reduce((sum, emd) => sum.plus(emd.amount), new Decimal(0)),
      forfeitedAmount: allEMDs
        .filter(emd => emd.status === EMDStatus.FORFEITED)
        .reduce((sum, emd) => sum.plus(emd.amount), new Decimal(0))
    };

    // Count by status
    allEMDs.forEach(emd => {
      statistics.byStatus[emd.status as EMDStatus]++;
    });

    return statistics;
  }

  /**
   * Gets overdue EMDs
   */
  static async getOverdueEMDs() {
    const today = new Date();
    
    return prisma.eMDTracking.findMany({
      where: {
        status: EMDStatus.PENDING,
        dueDate: {
          lt: today
        }
      },
      include: {
        offer: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
  }

  /**
   * Updates document path
   */
  static async updateDocument(id: string, documentPath: string) {
    return prisma.eMDTracking.update({
      where: { id },
      data: {
        documentPath,
        updatedAt: new Date()
      }
    });
  }
}