// src/types/index.ts
// This file defines all TypeScript interfaces and types used across the application

import { Decimal } from "@prisma/client/runtime/library";

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  departmentId: string;
  department: Department;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VENDOR // EMD Tracking types
  = "VENDOR",
}

export interface Department {
  id: string;
  name: string;
  // Add other department properties
}

// Budgetary Offer types
export interface BudgetaryOffer {
  id: string;
  tenderNo: string;
  amount: Decimal;
  emdAmount: Decimal;
  dueDate: Date;
  status: BudgetaryOfferStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BudgetaryOfferStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// EMD Tracking types
export interface EMDTracking {
  id: string;
  offerId: string;
  amount: Decimal;
  dueDate: Date;
  returnDate?: Date;
  status: EMDStatus;
  documentPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EMDStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  RETURNED = 'RETURNED',
  FORFEITED = 'FORFEITED',
}

// Invoice types
export interface Invoice {
  id: string;
  invoiceNo: string;
  poId: string;
  vendorId: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BudgetaryOfferCreateInput {
  tenderNo: string;
  amount: Decimal | number;
  emdAmount: Decimal | number;
  dueDate: Date | string;
  createdById: string;
}

// Add a type for update input
export interface BudgetaryOfferUpdateInput {
  tenderNo?: string;
  amount?: Decimal | number;
  emdAmount?: Decimal | number;
  dueDate?: Date | string;
}

type StatusRecord = Record<EMDStatus, number>;

// Request extension to include user information
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}