// src/types/loa.types.ts
import { Decimal } from '@prisma/client/runtime/library';

export enum LOAStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum AmendmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface LOARecordInput {
  loaNo: string;
  offerId: string;
  value: Decimal | string | number;
  scope: string;
  issuingAuthority: string;
  referenceNumber: string;
  receivedDate: string | Date;
  validityPeriod: string | Date;
  projectCode: string;
  department: string;
  remarks?: string;
}

export interface LOA {
  id: string;
  loaNo: string;
  offerId: string;
  value: Decimal;
  scope: string;
  status: LOAStatus;
  issuingAuthority: string;
  referenceNumber: string;
  receivedDate: Date;
  validityPeriod: Date;
  projectCode: string;
  department: string;
  remarks?: string;
  recordedById: string;
  managedById: string;
  recordedBy?: {
    name: string;
    email: string;
    department?: {
      deptCode: string;
      deptName: true;
    };
  };
  amendments?: LOAAmendment[];
  offer?: {
    tenderNo: string;
    amount: Decimal;
    status: string;
  };
}

export interface LOAAmendment {
  id: string;
  loaId: string;
  amendmentNo: number;
  amendmentType: string;
  additionalValue: Decimal;
  reason: string;
  effectiveDate: Date;
  validityExtension?: Date;
  scopeChanges?: string;
  attachmentPath?: string;
  status: AmendmentStatus;
  recordedById: string;
  recordedBy?: {
    name: string;
    email: string;
    department?: {
      deptCode: string;
      deptName: string;
    };
  };
  approvedById?: string;
  approvedBy?: {
    name: string;
    email: string;
  };
  approvedAt?: Date;
}

export interface LOAAmendmentInput {
  amendmentType: string;
  additionalValue: Decimal | string | number;
  reason: string;
  effectiveDate: string | Date;
  validityExtension?: string | Date;
  scopeChanges?: string;
  attachmentPath?: string;
}

export interface LOAUtilization {
  totalValue: Decimal;
  utilizedAmount: Decimal;
  remainingAmount: Decimal;
  utilizationPercentage: Decimal;
}