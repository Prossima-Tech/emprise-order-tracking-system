// src/types/loa.types.ts
import { Decimal } from '@prisma/client/runtime/library';
import { User } from './user';

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
  value: number;
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
      deptName: string;
    };
  };
  amendments?: LOAAmendment[];
  offer?: {
    tenderNo: string;
    amount: number;
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

export enum LOADocumentType {
  LOA_LETTER = 'LOA_LETTER',                    // Original LOA document
  AMENDMENT = 'AMENDMENT',                      // Amendment documents
  SCOPE_DOCUMENT = 'SCOPE_DOCUMENT',            // Scope of work documents
  TECHNICAL_SPECIFICATION = 'TECHNICAL_SPECIFICATION', // Technical specifications
  COMMERCIAL_TERMS = 'COMMERCIAL_TERMS',        // Commercial terms and conditions
  CORRESPONDENCE = 'CORRESPONDENCE',            // Official correspondence
  DRAWING = 'DRAWING',                         // Technical drawings
  SCHEDULE = 'SCHEDULE',                       // Project schedules
  COMPLIANCE = 'COMPLIANCE',                   // Compliance documents
  BANK_GUARANTEE = 'BANK_GUARANTEE',           // Bank guarantee documents
  INSURANCE = 'INSURANCE',                     // Insurance related documents
  OTHER = 'OTHER'                              // Other documents
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',           // Document is in draft state
  PENDING = 'PENDING',       // Pending review/approval
  APPROVED = 'APPROVED',     // Document has been approved
  REJECTED = 'REJECTED',     // Document has been rejected
  EXPIRED = 'EXPIRED',       // Document has expired
  SUPERSEDED = 'SUPERSEDED'  // Document has been replaced by a newer version
}

export enum DocumentAccessLevel {
  PUBLIC = 'PUBLIC',         // Accessible to all users
  INTERNAL = 'INTERNAL',     // Only internal users
  CONFIDENTIAL = 'CONFIDENTIAL', // Limited access
  RESTRICTED = 'RESTRICTED'  // Highly restricted access
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  filePath: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  changes?: string;         // Description of changes in this version
  user?: User;             // User who uploaded this version
}

export interface DocumentApproval {
  id: string;
  documentId: string;
  approvedBy: string;
  approvedAt: Date;
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
  user?: User;
}

export interface DocumentMetadata {
  pageCount?: number;
  createdBy?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  keywords?: string[];
  language?: string;
  documentNumber?: string;  // Reference number
  revisionNumber?: string;
  validUntil?: Date;
}

export interface LOADocument {
  id: string;
  loaId: string;
  documentType: LOADocumentType;
  status: DocumentStatus;
  accessLevel: DocumentAccessLevel;
  
  // File details
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;        // MIME type
  hash?: string;           // File hash for integrity check
  
  // Metadata
  title: string;
  description?: string;
  metadata?: DocumentMetadata;
  tags?: string[];
  
  // Versioning
  version: number;
  isLatestVersion: boolean;
  versions?: DocumentVersion[];
  
  // Workflow
  requiresApproval: boolean;
  approvals?: DocumentApproval[];
  
  // Tracking
  uploadedBy: string;
  uploadedAt: Date;
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
  
  // Relations
  relatedDocuments?: string[];  // IDs of related documents
  parentDocumentId?: string;    // For linked documents
  
  // Access Control
  accessGroups?: string[];      // Groups that can access this document
  accessUsers?: string[];       // Specific users that can access this document
  
  // Audit
  viewedBy?: Array<{
    userId: string;
    viewedAt: Date;
  }>;
  downloadedBy?: Array<{
    userId: string;
    downloadedAt: Date;
  }>;
  
  // References
  user?: User;                  // Uploaded by user details
  lastModifiedByUser?: User;    // Last modified by user details
}

export interface DocumentUploadInput {
  documentType: LOADocumentType;
  title: string;
  description?: string;
  accessLevel: DocumentAccessLevel;
  requiresApproval?: boolean;
  tags?: string[];
  metadata?: Partial<DocumentMetadata>;
}

export interface DocumentUpdateInput {
  title?: string;
  description?: string;
  documentType?: LOADocumentType;
  accessLevel?: DocumentAccessLevel;
  tags?: string[];
  metadata?: Partial<DocumentMetadata>;
}

export interface DocumentSearchParams {
  loaId?: string;
  documentType?: LOADocumentType;
  status?: DocumentStatus;
  accessLevel?: DocumentAccessLevel;
  uploadedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  keyword?: string;
  version?: number;
}

export interface DocumentStats {
  totalCount: number;
  totalSize: number;
  byType: Record<LOADocumentType, number>;
  byStatus: Record<DocumentStatus, number>;
  byAccessLevel: Record<DocumentAccessLevel, number>;
  recentUploads: number;
  pendingApprovals: number;
}

// Custom type guards
export const isConfidentialDocument = (doc: LOADocument): boolean => {
  return doc.accessLevel === DocumentAccessLevel.CONFIDENTIAL || 
         doc.accessLevel === DocumentAccessLevel.RESTRICTED;
};

export const requiresApproval = (doc: LOADocument): boolean => {
  return doc.requiresApproval && 
         (!doc.approvals || doc.approvals.length === 0);
};

export const isDocumentExpired = (doc: LOADocument): boolean => {
  if (!doc.metadata?.validUntil) return false;
  return new Date(doc.metadata.validUntil) < new Date();
};

// Utility type for document permissions
export interface DocumentPermissions {
  canView: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canShare: boolean;
}

// Helper function to check document permissions
export const getDocumentPermissions = (
  document: LOADocument, 
  userId: string,
  userRoles: string[]
): DocumentPermissions => {
  // Implement permission logic based on your requirements
  return {
    canView: true,
    canDownload: true,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canShare: false,
  };
};