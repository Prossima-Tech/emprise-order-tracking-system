import { ApprovalAction, POStatus } from "./constants";
import { LOA } from "./LOA";
import { PurchaseOrderItem } from "./PurchaseOrderItem";
import { Site } from "./Site";
import { User } from "./User";
import { Vendor } from "./Vendor";
import { AdditionalCharge } from "../../application/dtos/purchaseOrder/PurchaseOrderDto";

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  loa: LOA;
  loaId: string;
  vendor: Vendor;
  vendorId: string;
  items: PurchaseOrderItem[];
  site: {
    id: string;
    name: string;
    code: string;
    zoneId: string;
  };
  siteId: string;
  requirementDesc: string;
  termsConditions: string;
  shipToAddress: string;
  baseAmount: number;
  taxAmount: number;
  additionalCharges: AdditionalCharge[];
  totalAmount: number;
  notes?: string;
  documentUrl?: string;
  status: POStatus;
  createdBy: User;
  createdById: string;
  approver?: User;
  approverId?: string;
  approvalComments?: string;     // Added for approval comments
  rejectionReason?: string;   // Added for rejection reason
  approvalHistory: ApprovalAction[]; // Added for tracking approval flow
  documentHash?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PDFItemData {
  item: {
    name: string;
    description?: string;
  };
  quantity: number;
  unitPrice: number;
  // taxRates: {
  //   igst: number;
  //   sgst: number;
  //   ugst: number;
  // };
  // taxAmounts: {
  //   igst: number;
  //   sgst: number;
  //   ugst: number;
  // };
  // baseAmount: number;
  // totalAmount: number;
}

export interface PDFGenerationData {
  id: string;
  poNumber: string;
  createdAt: Date;
  loa: {
    loaNumber: string;
    loaValue: number;
  };
  vendor: {
    name: string;
    email: string;
  };
  totalAmount: number;
  items: PDFItemData[];
  requirementDesc: string;
  termsConditions: string;
  shipToAddress: string;
  notes?: string;
  status: string;
  createdBy: {
    name: string;
    department: string;
    role: string;
  };
  tags: string[];
  additionalCharges: AdditionalCharge[];
  approvalStatus?: {
    status: POStatus;
    approvalNotes?: string;
    rejectionReason?: string;
    approvedBy?: {
      name: string;
      department: string;
      role: string;
    };
  };
}