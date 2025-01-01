import { LOA, LOAStatus, LOAAmendmentInput, LOAUtilization, LOAAmendment, LOARecordInput, AmendmentStatus } from '../types/loa.types';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';

export class LOAModel {
  static async recordLOA(data: LOARecordInput, recordedById: string): Promise<LOA> {
    const result = await prisma.lOA.create({
      data: {
        loaNo: data.loaNo,
        offerId: data.offerId,
        value: new Decimal(data.value.toString()),
        scope: data.scope,
        status: LOAStatus.ACTIVE,
        issuingAuthority: data.issuingAuthority,
        referenceNumber: data.referenceNumber,
        receivedDate: new Date(data.receivedDate),
        validityPeriod: new Date(data.validityPeriod),
        projectCode: data.projectCode,
        department: data.department,
        remarks: data.remarks,
        recordedById,
        managedById: recordedById // Adding this field to fix the type error
      },
      include: {
        offer: {
          select: {
            tenderNo: true,
            amount: true,
            status: true
          }
        },
        recordedBy: {
          select: {
            name: true,
            email: true,
            department: {
              select: {
                deptCode: true,
                deptName: true
              }
            }
          }
        }
      }
    });

    return this.convertToLOA(result);
  }

  static async findById(id: string): Promise<LOA | null> {
    const result = await prisma.lOA.findUnique({
      where: { id },
      include: {
        offer: {
          select: {
            tenderNo: true,
            amount: true,
            status: true
          }
        },
        recordedBy: {
          select: {
            name: true,
            email: true,
            department: {
              select: {
                deptCode: true,
                deptName: true
              }
            }
          }
        },
        amendments: {
          include: {
            recordedBy: {
              select: {
                name: true,
                email: true,
                department: {
                  select: {
                    deptCode: true,
                    deptName: true
                  }
                }
              }
            }
          },
          orderBy: {
            amendmentNo: 'asc'
          }
        }
      }
    });

    return this.convertToLOA(result);
  }

  static async findByLoaNo(loaNo: string): Promise<LOA | null> {
    const result = await prisma.lOA.findUnique({
      where: { loaNo },
      include: {
        offer: {
          select: {
            tenderNo: true,
            amount: true,
            status: true
          }
        },
        recordedBy: {
          select: {
            name: true,
            email: true,
            department: {
              select: {
                deptCode: true,
                deptName: true
              }
            }
          }
        },
        amendments: {
          include: {
            recordedBy: {
              select: {
                name: true,
                email: true,
                department: {
                  select: {
                    deptCode: true,
                    deptName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // If no LOA found, return null
    if (!result) return null;

    // Convert the result to LOA type
    return this.convertToLOA(result);
  }

  static async recordAmendment(
    loaId: string,
    data: LOAAmendmentInput,
    recordedById: string
  ): Promise<LOAAmendment> {
    const lastAmendment = await prisma.lOAAmendment.findFirst({
      where: { loaId },
      orderBy: { amendmentNo: 'desc' }
    });

    const amendmentNo = (lastAmendment?.amendmentNo || 0) + 1;

    const result = await prisma.lOAAmendment.create({
      data: {
        loaId,
        amendmentNo,
        amendmentType: data.amendmentType,
        additionalValue: new Decimal(data.additionalValue.toString()),
        reason: data.reason,
        effectiveDate: new Date(data.effectiveDate),
        validityExtension: data.validityExtension ? new Date(data.validityExtension) : null,
        scopeChanges: data.scopeChanges,
        attachmentPath: data.attachmentPath,
        status: AmendmentStatus.PENDING,
        recordedById
      },
      include: {
        recordedBy: {
          select: {
            name: true,
            email: true,
            department: {
              select: {
                deptCode: true,
                deptName: true
              }
            }
          }
        }
      }
    });

    return this.convertToAmendment(result);
  }

  private static convertToLOA(result: any): LOA {
    // First check if result exists
    if (!result) {
      throw new Error('Cannot convert null result to LOA');
    }

    try {
      return {
        id: result.id,
        loaNo: result.loaNo,
        offerId: result.offerId,
        value: result.value instanceof Decimal ? result.value : new Decimal(result.value),
        scope: result.scope,
        status: result.status as LOAStatus,
        issuingAuthority: result.issuingAuthority,
        referenceNumber: result.referenceNumber,
        receivedDate: new Date(result.receivedDate),
        validityPeriod: new Date(result.validityPeriod),
        projectCode: result.projectCode,
        department: result.department,
        remarks: result.remarks,
        recordedById: result.recordedById,
        managedById: result.managedById,
        
        // Handle optional relations
        recordedBy: result.recordedBy ? {
          name: result.recordedBy.name,
          email: result.recordedBy.email,
          department: result.recordedBy.department ? {
            deptCode: result.recordedBy.department.deptCode,
            deptName: result.recordedBy.department.deptName
          } : undefined
        } : undefined,

        // Handle offer relation
        offer: result.offer ? {
          tenderNo: result.offer.tenderNo,
          amount: result.offer.amount instanceof Decimal 
            ? result.offer.amount 
            : new Decimal(result.offer.amount),
          status: result.offer.status
        } : undefined,

        // Handle amendments
        amendments: result.amendments 
          ? result.amendments.map(this.convertToAmendment)
          : []
      };
    } catch (error) {
      console.error('Error converting Prisma result to LOA:', error);
      throw new Error('Failed to convert database result to LOA');
    }
  }

  private static convertToAmendment(amendment: any): LOAAmendment {
    if (!amendment) {
      throw new Error('Cannot convert null amendment');
    }

    return {
      id: amendment.id,
      loaId: amendment.loaId,
      amendmentNo: amendment.amendmentNo,
      amendmentType: amendment.amendmentType,
      additionalValue: amendment.additionalValue instanceof Decimal 
        ? amendment.additionalValue 
        : new Decimal(amendment.additionalValue),
      reason: amendment.reason,
      effectiveDate: new Date(amendment.effectiveDate),
      validityExtension: amendment.validityExtension 
        ? new Date(amendment.validityExtension) 
        : undefined,
      scopeChanges: amendment.scopeChanges,
      attachmentPath: amendment.attachmentPath,
      status: amendment.status as AmendmentStatus,
      recordedById: amendment.recordedById,
      recordedBy: amendment.recordedBy ? {
        name: amendment.recordedBy.name,
        email: amendment.recordedBy.email,
        department: amendment.recordedBy.department ? {
          deptCode: amendment.recordedBy.department.deptCode,
          deptName: amendment.recordedBy.department.deptName
        } : undefined
      } : undefined,
      approvedById: amendment.approvedById,
      approvedBy: amendment.approvedBy ? {
        name: amendment.approvedBy.name,
        email: amendment.approvedBy.email
      } : undefined,
      approvedAt: amendment.approvedAt ? new Date(amendment.approvedAt) : undefined
    };
  }


  // In LOAModel class
static async approveAmendment(amendmentId: string, approverId: string): Promise<LOAAmendment> {
  const result = await prisma.lOAAmendment.update({
    where: { id: amendmentId },
    data: {
      status: AmendmentStatus.APPROVED,
      approvedById: approverId,
      approvedAt: new Date()
    },
    include: {
      recordedBy: {
        select: {
          name: true,
          email: true,
          department: {
            select: {
              deptCode: true,
              deptName: true
            }
          }
        }
      },
      approvedBy: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  // Convert the result to match LOAAmendment type
  return {
    id: result.id,
    loaId: result.loaId,
    amendmentNo: result.amendmentNo,
    amendmentType: result.amendmentType,
    additionalValue: result.additionalValue instanceof Decimal 
      ? result.additionalValue 
      : new Decimal(result.additionalValue),
    reason: result.reason,
    effectiveDate: result.effectiveDate,
    validityExtension: result.validityExtension || undefined, // Convert null to undefined
    scopeChanges: result.scopeChanges || undefined,
    attachmentPath: result.attachmentPath || undefined,
    status: result.status as AmendmentStatus,
    recordedById: result.recordedById,
    recordedBy: result.recordedBy,
    approvedById: result.approvedById || undefined,
    approvedBy: result.approvedBy || undefined,
    approvedAt: result.approvedAt || undefined
  };
}

  static async getUtilization(loaId: string): Promise<LOAUtilization | null> {
    const loa = await prisma.lOA.findUnique({
      where: { id: loaId },
      include: {
        amendments: {
          where: { status: AmendmentStatus.APPROVED }
        },
        purchaseOrders: {
          where: { status: 'APPROVED' },
          include: {
            items: true
          }
        }
      }
    });

    if (!loa) return null;

    const baseValue = new Decimal(loa.value.toString());
    
    const amendmentsValue = loa.amendments.reduce(
      (sum, amendment) => sum.add(new Decimal(amendment.additionalValue.toString())),
      new Decimal(0)
    );

    const totalValue = baseValue.add(amendmentsValue);

    const utilizedAmount = loa.purchaseOrders.reduce((sum, po) => {
      const poValue = po.items.reduce(
        (itemSum, item) => itemSum.add(
          new Decimal(item.quantity).mul(new Decimal(item.unitPrice))
        ),
        new Decimal(0)
      );
      return sum.add(poValue);
    }, new Decimal(0));

    return {
      totalValue,
      utilizedAmount,
      remainingAmount: totalValue.sub(utilizedAmount),
      utilizationPercentage: totalValue.eq(0) 
        ? new Decimal(0) 
        : utilizedAmount.div(totalValue).mul(100)
    };
  }

  
}