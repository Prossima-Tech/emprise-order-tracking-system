// infrastructure/persistence/repositories/PrismaLoaRepository.ts
import { PrismaClient, Prisma, LOA as PrismaLOA, Amendment as PrismaAmendment } from '@prisma/client';
import { DeliveryPeriod } from '../../../application/dtos/loa/CreateLoaDto';
import { LOA, Amendment } from '../../../domain/entities/LOA';

export class PrismaLoaRepository {
  constructor(private prisma: PrismaClient) {}

  private mapPrismaLoaToLoa(prismaLoa: PrismaLOA & {
    amendments: PrismaAmendment[];
    purchaseOrders: any[]; // Replace 'any' with your PO type
    invoices?: any[];
    site?: any;
  }): LOA {
    // Don't parse the deliveryPeriod as it's already an object
    return {
      id: prismaLoa.id,
      loaNumber: prismaLoa.loaNumber,
      loaValue: prismaLoa.loaValue,
      deliveryPeriod: prismaLoa.deliveryPeriod ? {
        start: new Date((prismaLoa.deliveryPeriod as any).start),
        end: new Date((prismaLoa.deliveryPeriod as any).end)
      } : { start: new Date(), end: new Date() },
      dueDate: prismaLoa.dueDate || undefined,
      orderReceivedDate: prismaLoa.orderReceivedDate || undefined,
      status: (prismaLoa.status || 'NOT_STARTED') as any, // Ensure status is always set
      workDescription: prismaLoa.workDescription,
      documentUrl: prismaLoa.documentUrl,
      tags: prismaLoa.tags,
      remarks: prismaLoa.remarks || undefined,
      tenderNo: prismaLoa.tenderNo || undefined,
      orderPOC: prismaLoa.orderPOC || undefined,
      fdBgDetails: prismaLoa.fdBgDetails || undefined,
      amendments: prismaLoa.amendments.map(amendment => ({
        id: amendment.id,
        amendmentNumber: amendment.amendmentNumber,
        documentUrl: amendment.documentUrl,
        tags: amendment.tags,
        createdAt: amendment.createdAt,
        updatedAt: amendment.updatedAt,
        loaId: amendment.loaId
      })),
      invoices: prismaLoa.invoices || [],
      site: {
        id: prismaLoa.site.id,
        name: prismaLoa.site.name,
        code: prismaLoa.site.code,
        zoneId: prismaLoa.site.zoneId,
      },
      siteId: prismaLoa.siteId || '',
      purchaseOrders: prismaLoa.purchaseOrders,
      hasEmd: prismaLoa.hasEmd,
      emdAmount: prismaLoa.emdAmount || undefined,
      hasSecurityDeposit: prismaLoa.hasSecurityDeposit,
      securityDepositAmount: prismaLoa.securityDepositAmount || undefined,
      securityDepositDocumentUrl: prismaLoa.securityDepositDocumentUrl || undefined,
      hasPerformanceGuarantee: prismaLoa.hasPerformanceGuarantee,
      performanceGuaranteeAmount: prismaLoa.performanceGuaranteeAmount || undefined,
      performanceGuaranteeDocumentUrl: prismaLoa.performanceGuaranteeDocumentUrl || undefined,
      createdAt: prismaLoa.createdAt,
      updatedAt: prismaLoa.updatedAt
    };
  }

  private mapPrismaAmendmentToAmendment(prismaAmendment: PrismaAmendment & {
    loa: PrismaLOA & {
      amendments: PrismaAmendment[];
      purchaseOrders: any[]; // Replace 'any' with your PO type
    };
  }): Amendment {
    return {
      id: prismaAmendment.id,
      amendmentNumber: prismaAmendment.amendmentNumber,
      documentUrl: prismaAmendment.documentUrl,
      tags: prismaAmendment.tags,
      loaId: prismaAmendment.loaId,
      loa: this.mapPrismaLoaToLoa(prismaAmendment.loa),
      createdAt: prismaAmendment.createdAt,
      updatedAt: prismaAmendment.updatedAt
    };
  }

  async create(data: {
    loaNumber: string;
    loaValue: number;
    deliveryPeriod: DeliveryPeriod;
    workDescription: string;
    documentUrl: string;
    tags: string[];
    siteId: string;
    remarks?: string;
    tenderNo?: string;
    orderPOC?: string;
    fdBgDetails?: string;
    hasEmd?: boolean;
    emdAmount?: number;
    hasSecurityDeposit?: boolean;
    securityDepositAmount?: number;
    securityDepositDocumentUrl?: string;
    hasPerformanceGuarantee?: boolean;
    performanceGuaranteeAmount?: number;
    performanceGuaranteeDocumentUrl?: string;
  }): Promise<LOA> {
    try {
      const prismaLoa = await this.prisma.lOA.create({
        data: {
          loaNumber: data.loaNumber,
          loaValue: data.loaValue,
          deliveryPeriod: {
            start: new Date(data.deliveryPeriod.start),
            end: new Date(data.deliveryPeriod.end)
          },
          workDescription: data.workDescription,
          documentUrl: data.documentUrl,
          tags: data.tags,
          site: {
            connect: { id: data.siteId }
          },
          remarks: data.remarks || null,
          tenderNo: data.tenderNo || null,
          orderPOC: data.orderPOC || null,
          fdBgDetails: data.fdBgDetails || null,
          hasEmd: data.hasEmd || false,
          emdAmount: data.emdAmount || null,
          hasSecurityDeposit: data.hasSecurityDeposit || false,
          securityDepositAmount: data.securityDepositAmount || null,
          securityDepositDocumentUrl: data.securityDepositDocumentUrl || null,
          hasPerformanceGuarantee: data.hasPerformanceGuarantee || false,
          performanceGuaranteeAmount: data.performanceGuaranteeAmount || null,
          performanceGuaranteeDocumentUrl: data.performanceGuaranteeDocumentUrl || null
        },
        include: {
          amendments: true,
          purchaseOrders: true,
          site: true
        }
      });

      return this.mapPrismaLoaToLoa(prismaLoa);
    } catch (error) {
      console.error('PrismaLoaRepository create error:', error);
      throw error;
    }
  }

  async update(id: string, data: any): Promise<LOA> {
    // Convert plain object to Prisma update structure
    const updateData: Prisma.LOAUpdateInput = {};

    // Only set fields that are defined
    if (data.loaNumber !== undefined) updateData.loaNumber = data.loaNumber;
    if (data.loaValue !== undefined) updateData.loaValue = data.loaValue;
    if (data.workDescription !== undefined) updateData.workDescription = data.workDescription;
    if (data.documentUrl !== undefined) updateData.documentUrl = data.documentUrl;
    if (data.tags) updateData.tags = { set: data.tags };
    
    // Add status field handling
    if (data.status !== undefined) updateData.status = data.status;
    
    // Handle delivery period
    if (data.deliveryPeriod) {
      updateData.deliveryPeriod = {
        start: new Date(data.deliveryPeriod.start),
        end: new Date(data.deliveryPeriod.end)
      };
    }
    
    // Handle optional EDM fields
    if (data.hasEmd !== undefined) updateData.hasEmd = data.hasEmd;
    if (data.emdAmount !== undefined) updateData.emdAmount = data.emdAmount;
    
    // Handle optional security deposit fields
    if (data.hasSecurityDeposit !== undefined) updateData.hasSecurityDeposit = data.hasSecurityDeposit;
    if (data.securityDepositAmount !== undefined) updateData.securityDepositAmount = data.securityDepositAmount;
    if (data.securityDepositDocumentUrl !== undefined) updateData.securityDepositDocumentUrl = data.securityDepositDocumentUrl;
    
    // Handle optional performance guarantee fields
    if (data.hasPerformanceGuarantee !== undefined) updateData.hasPerformanceGuarantee = data.hasPerformanceGuarantee;
    if (data.performanceGuaranteeAmount !== undefined) updateData.performanceGuaranteeAmount = data.performanceGuaranteeAmount;
    if (data.performanceGuaranteeDocumentUrl !== undefined) updateData.performanceGuaranteeDocumentUrl = data.performanceGuaranteeDocumentUrl;

    // Handle optional LOA fields
    if (data.remarks !== undefined) updateData.remarks = data.remarks;
    if (data.tenderNo !== undefined) updateData.tenderNo = data.tenderNo;
    if (data.orderPOC !== undefined) updateData.orderPOC = data.orderPOC;
    if (data.fdBgDetails !== undefined) updateData.fdBgDetails = data.fdBgDetails;

    try {
      const prismaLoa = await this.prisma.lOA.update({
        where: { id },
        data: updateData,
        include: {
          amendments: true,
          purchaseOrders: true,
          site: true
        }
      });

      return this.mapPrismaLoaToLoa(prismaLoa);
    } catch (error) {
      console.error('PrismaLoaRepository update error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<LOA> {
    const prismaLoa = await this.prisma.lOA.delete({
      where: { id },
      include: {
        amendments: true,
        purchaseOrders: true
      }
    });

    return this.mapPrismaLoaToLoa(prismaLoa);
  }

  async findById(id: string): Promise<LOA | null> {
    const prismaLoa = await this.prisma.lOA.findUnique({
      where: { id },
      include: {
        amendments: true,
        purchaseOrders: true,
        invoices: true,
        site: true
      }
    });

    return prismaLoa ? this.mapPrismaLoaToLoa(prismaLoa) : null;
  }

  async findByLoaNumber(loaNumber: string): Promise<LOA | null> {
    const prismaLoa = await this.prisma.lOA.findUnique({
      where: { loaNumber },
      include: {
        amendments: true,
        purchaseOrders: true,
        site: true
      }
    });

    return prismaLoa ? this.mapPrismaLoaToLoa(prismaLoa) : null;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    searchTerm?: string;
    siteId?: string;
    zoneId?: string;
    status?: string;
    minValue?: number;
    maxValue?: number;
    hasEMD?: boolean;
    hasSecurity?: boolean;
    hasPerformanceGuarantee?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<LOA[]> {
    // Determine sort configuration
    let orderBy: any = { createdAt: 'desc' }; // Default sorting

    if (params.sortBy && params.sortOrder) {
      switch (params.sortBy) {
        case 'loaValue':
          orderBy = { loaValue: params.sortOrder };
          break;
        case 'deliveryStartDate':
          orderBy = { deliveryPeriod: { start: params.sortOrder } };
          break;
        case 'deliveryEndDate':
          orderBy = { deliveryPeriod: { end: params.sortOrder } };
          break;
        case 'createdAt':
          orderBy = { createdAt: params.sortOrder };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    // Build where clause with filters
    const whereConditions: any[] = [];

    if (params.siteId) {
      whereConditions.push({ siteId: params.siteId });
    }

    if (params.zoneId) {
      whereConditions.push({ site: { zoneId: params.zoneId } });
    }

    if (params.status) {
      whereConditions.push({ status: params.status });
    }

    if (params.minValue !== undefined || params.maxValue !== undefined) {
      const valueFilter: any = {};
      if (params.minValue !== undefined) {
        valueFilter.gte = params.minValue;
      }
      if (params.maxValue !== undefined) {
        valueFilter.lte = params.maxValue;
      }
      whereConditions.push({ loaValue: valueFilter });
    }

    if (params.hasEMD !== undefined) {
      whereConditions.push({ hasEmd: params.hasEMD });
    }

    if (params.hasSecurity !== undefined) {
      whereConditions.push({ hasSecurityDeposit: params.hasSecurity });
    }

    if (params.hasPerformanceGuarantee !== undefined) {
      whereConditions.push({ hasPerformanceGuarantee: params.hasPerformanceGuarantee });
    }

    if (params.searchTerm) {
      whereConditions.push({
        OR: [
          { loaNumber: { contains: params.searchTerm, mode: 'insensitive' } },
          { workDescription: { contains: params.searchTerm, mode: 'insensitive' } },
          { tags: { has: params.searchTerm } },
          { site: {
            OR: [
              { name: { contains: params.searchTerm, mode: 'insensitive' } },
              { code: { contains: params.searchTerm, mode: 'insensitive' } }
            ]
          }}
        ]
      });
    }

    const prismaLoas = await this.prisma.lOA.findMany({
      skip: params.skip,
      take: params.take,
      where: whereConditions.length > 0 ? { AND: whereConditions } : {},
      include: {
        amendments: true,
        purchaseOrders: true,
        invoices: true,
        site: true
      },
      orderBy
    });

    return prismaLoas.map(this.mapPrismaLoaToLoa.bind(this));
  }

  async count(params: {
    searchTerm?: string;
    siteId?: string;
    zoneId?: string;
    status?: string;
    minValue?: number;
    maxValue?: number;
    hasEMD?: boolean;
    hasSecurity?: boolean;
    hasPerformanceGuarantee?: boolean;
  }): Promise<number> {
    // Build where clause with filters - same logic as findAll
    const whereConditions: any[] = [];

    if (params.siteId) {
      whereConditions.push({ siteId: params.siteId });
    }

    if (params.zoneId) {
      whereConditions.push({ site: { zoneId: params.zoneId } });
    }

    if (params.status) {
      whereConditions.push({ status: params.status });
    }

    if (params.minValue !== undefined || params.maxValue !== undefined) {
      const valueFilter: any = {};
      if (params.minValue !== undefined) {
        valueFilter.gte = params.minValue;
      }
      if (params.maxValue !== undefined) {
        valueFilter.lte = params.maxValue;
      }
      whereConditions.push({ loaValue: valueFilter });
    }

    if (params.hasEMD !== undefined) {
      whereConditions.push({ hasEmd: params.hasEMD });
    }

    if (params.hasSecurity !== undefined) {
      whereConditions.push({ hasSecurityDeposit: params.hasSecurity });
    }

    if (params.hasPerformanceGuarantee !== undefined) {
      whereConditions.push({ hasPerformanceGuarantee: params.hasPerformanceGuarantee });
    }

    if (params.searchTerm) {
      whereConditions.push({
        OR: [
          { loaNumber: { contains: params.searchTerm, mode: 'insensitive' } },
          { workDescription: { contains: params.searchTerm, mode: 'insensitive' } },
          { tags: { has: params.searchTerm } },
          { site: {
            OR: [
              { name: { contains: params.searchTerm, mode: 'insensitive' } },
              { code: { contains: params.searchTerm, mode: 'insensitive' } }
            ]
          }}
        ]
      });
    }

    return this.prisma.lOA.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : {}
    });
  }

  async createAmendment(data: {
    amendmentNumber: string;
    documentUrl: string;
    loaId: string;
    tags: string[];
  }): Promise<Amendment> {
    const prismaAmendment = await this.prisma.amendment.create({
      data,
      include: {
        loa: {
          include: {
            amendments: true,
            purchaseOrders: true,
            site: true
          }
        }
      }
    });

    return this.mapPrismaAmendmentToAmendment(prismaAmendment);
  }

  async updateAmendment(id: string, data: Partial<Omit<Amendment, 'id' | 'loa'>>): Promise<Amendment> {
    const updateData: Prisma.AmendmentUpdateInput = {
      amendmentNumber: data.amendmentNumber,
      documentUrl: data.documentUrl,
      tags: data.tags ? { set: data.tags } : undefined
    };

    const prismaAmendment = await this.prisma.amendment.update({
      where: { id },
      data: updateData,
      include: {
        loa: {
          include: {
            amendments: true,
            purchaseOrders: true,
            site: true
          }
        }
      }
    });

    return this.mapPrismaAmendmentToAmendment(prismaAmendment);
  }

  async deleteAmendment(id: string): Promise<Amendment> {
    const prismaAmendment = await this.prisma.amendment.delete({
      where: { id },
      include: {
        loa: {
          include: {
            amendments: true,
            purchaseOrders: true,
            site: true
          }
        }
      }
    });

    return this.mapPrismaAmendmentToAmendment(prismaAmendment);
  }

  async findAmendmentById(id: string): Promise<Amendment | null> {
    const prismaAmendment = await this.prisma.amendment.findUnique({
      where: { id },
      include: {
        loa: {
          include: {
            amendments: true,
            purchaseOrders: true,
            site: true
          }
        }
      }
    });

    return prismaAmendment ? this.mapPrismaAmendmentToAmendment(prismaAmendment) : null;
  }

  /**
   * Create an invoice record for an LOA
   */
  async createInvoice(data: {
    loaId: string;
    invoiceNumber?: string;
    invoiceAmount?: number;
    totalReceivables?: number;
    actualAmountReceived?: number;
    amountDeducted?: number;
    amountPending?: number;
    deductionReason?: string;
    billLinks?: string;
    invoicePdfUrl?: string;
    remarks?: string;
  }): Promise<any> {
    try {
      const invoice = await this.prisma.invoice.create({
        data: {
          loaId: data.loaId,
          invoiceNumber: data.invoiceNumber,
          invoiceAmount: data.invoiceAmount,
          totalReceivables: data.totalReceivables,
          actualAmountReceived: data.actualAmountReceived,
          amountDeducted: data.amountDeducted,
          amountPending: data.amountPending,
          deductionReason: data.deductionReason,
          billLinks: data.billLinks,
          invoicePdfUrl: data.invoicePdfUrl,
          remarks: data.remarks,
        }
      });
      return invoice;
    } catch (error) {
      console.error('PrismaLoaRepository createInvoice error:', error);
      throw error;
    }
  }

  /**
   * Find invoice by LOA ID
   */
  async findInvoiceByLoaId(loaId: string): Promise<any | null> {
    try {
      const invoice = await this.prisma.invoice.findFirst({
        where: { loaId }
      });
      return invoice;
    } catch (error) {
      console.error('PrismaLoaRepository findInvoiceByLoaId error:', error);
      throw error;
    }
  }

  /**
   * Update an existing invoice record
   */
  async updateInvoice(id: string, data: {
    invoiceNumber?: string;
    invoiceAmount?: number;
    totalReceivables?: number;
    actualAmountReceived?: number;
    amountDeducted?: number;
    amountPending?: number;
    deductionReason?: string;
    billLinks?: string;
    invoicePdfUrl?: string;
    remarks?: string;
  }): Promise<any> {
    try {
      const invoice = await this.prisma.invoice.update({
        where: { id },
        data: {
          invoiceNumber: data.invoiceNumber,
          invoiceAmount: data.invoiceAmount,
          totalReceivables: data.totalReceivables,
          actualAmountReceived: data.actualAmountReceived,
          amountDeducted: data.amountDeducted,
          amountPending: data.amountPending,
          deductionReason: data.deductionReason,
          billLinks: data.billLinks,
          invoicePdfUrl: data.invoicePdfUrl,
          remarks: data.remarks,
        }
      });
      return invoice;
    } catch (error) {
      console.error('PrismaLoaRepository updateInvoice error:', error);
      throw error;
    }
  }
}