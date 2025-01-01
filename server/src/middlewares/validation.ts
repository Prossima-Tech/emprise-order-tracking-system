// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { LOAStatus } from '../types/loa.types';
import prisma from '../config/database';
import { VendorCategory, VendorStatus } from '../types/master.types';

export const validateRegister = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
  
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('role')
    .isIn(['ADMIN', 'MANAGER', 'USER', 'VENDOR']).withMessage('Invalid role'),
  
  body('departmentId')
    .isUUID().withMessage('Invalid department ID'),

];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),

];


export const validateLOA = [
  body('loaNo')
    .notEmpty().withMessage('LOA number is required')
    .matches(/^[A-Z0-9-/]+$/).withMessage('Invalid LOA number format'),

  body('offerId')
    .notEmpty().withMessage('Offer ID is required')
    .isUUID().withMessage('Invalid offer ID'),

  body('value')
    .notEmpty().withMessage('Value is required')
    .isNumeric().withMessage('Value must be a number')
    .isFloat({ min: 0 }).withMessage('Value must be greater than 0'),

  body('scope')
    .notEmpty().withMessage('Scope is required')
    .isLength({ min: 10 }).withMessage('Scope description is too short'),

  body('receivedDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),

  body('validityPeriod')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Validity period must be in the future');
      }
      return true;
    }),

  body('issuingAuthority')
    .optional()
    .isLength({ min: 2 }).withMessage('Issuing authority name is too short'),

  body('remarks')
    .optional()
    .isString().withMessage('Remarks must be a string')
];

export const validateLOAAmendment = [
  body('additionalValue')
    .isNumeric().withMessage('Additional value must be a number')
    .isFloat({ min: 0 }).withMessage('Additional value must be greater than 0'),

  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),

  body('effectiveDate')
    .isISO8601().withMessage('Effective date must be a valid date')
    .custom((value: string) => {
      const effectiveDate = new Date(value);
      const today = new Date();
      if (effectiveDate < today) {
        throw new Error('Effective date cannot be in the past');
      }
      return true;
    }),
];

export const validateLOAStatus = [
  body('status')
    .isIn(Object.values(LOAStatus)).withMessage('Invalid status')
];

// Custom type for validation middleware
type ValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// Helper function to process validation results
const handleValidationResult: ValidationMiddleware = (req, res, next): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array()
    });
    return;
  }
  next();
};


export const validateLOARecord: (ValidationChain | ValidationMiddleware)[] = [
  // Basic required fields with simple validation
  body('loaNo')
    .notEmpty().withMessage('LOA number is required')
    .trim(),

  body('offerId')
    .notEmpty().withMessage('Offer ID is required')
    .isUUID().withMessage('Invalid offer ID format'),

  body('value')
    .notEmpty().withMessage('Value is required')
    .isFloat({ min: 0 }).withMessage('Value must be a positive number'),

  body('scope')
    .notEmpty().withMessage('Scope is required')
    .trim(),

  body('issuingAuthority')
    .notEmpty().withMessage('Issuing authority is required')
    .trim(),

  body('referenceNumber')
    .notEmpty().withMessage('Reference number is required')
    .trim(),

  // Date validations with more flexible formats
  body('receivedDate')
    .notEmpty().withMessage('Received date is required')
    .isDate().withMessage('Invalid date format - Use YYYY-MM-DD'),

  body('validityPeriod')
    .notEmpty().withMessage('Validity period is required')
    .isDate().withMessage('Invalid date format - Use YYYY-MM-DD'),

  // Simple required fields
  body('projectCode')
    .notEmpty().withMessage('Project code is required')
    .trim(),

  body('department')
    .notEmpty().withMessage('Department is required')
    .trim(),

  // Optional field
  body('remarks')
    .optional()
    .trim(),

  handleValidationResult
];

export const validateAmendment: (ValidationChain | ValidationMiddleware)[] = [
  body('amendmentType')
    .notEmpty().withMessage('Amendment type is required')
    .trim(),

  body('additionalValue')
    .notEmpty().withMessage('Additional value is required')
    .isFloat({ min: 0 }).withMessage('Additional value must be a positive number'),

  body('reason')
    .notEmpty().withMessage('Reason is required')
    .trim(),

  body('effectiveDate')
    .notEmpty().withMessage('Effective date is required')
    .isDate().withMessage('Invalid date format - Use YYYY-MM-DD'),

  // Optional fields with basic validation
  body('validityExtension')
    .optional()
    .isDate().withMessage('Invalid date format - Use YYYY-MM-DD'),

  body('scopeChanges')
    .optional()
    .trim(),

  body('attachmentPath')
    .optional()
    .trim(),

  handleValidationResult
];


// Budgetary Offer validation rules
export const validateBudgetaryOffer: (ValidationChain | ValidationMiddleware)[] = [
  body('tenderNo')
    .trim()
    .notEmpty().withMessage('Tender number is required')
    .matches(/^[A-Z0-9-]+$/).withMessage('Tender number must contain only uppercase letters, numbers, and hyphens')
    .isLength({ min: 5, max: 20 }).withMessage('Tender number must be between 5 and 20 characters'),
  
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0 }).withMessage('Amount must be greater than 0')
    .custom((value: number) => {
      if (value < 100000) {
        throw new Error('Amount must be at least ₹1,00,000');
      }
      return true;
    }),

  body('emdAmount')
    .optional()
    .isNumeric().withMessage('EMD amount must be a number')
    .isFloat({ min: 0 }).withMessage('EMD amount must be greater than 0')
    .custom((value: number, { req }) => {
      const tenderValue = req.body.amount;
      if (value > tenderValue * 0.05) {
        throw new Error('EMD amount cannot exceed 5% of tender value');
      }
      return true;
    }),

  body('dueDate')
    .isISO8601().withMessage('Due date must be a valid date')
    .custom((value: string) => {
      const dueDate = new Date(value);
      const today = new Date();
      if (dueDate < today) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),

  handleValidationResult
];

// EMD Tracking validation rules
export const validateEMDTracking: (ValidationChain | ValidationMiddleware)[] = [
  body('offerId')
    .isUUID().withMessage('Invalid offer ID'),

  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0 }).withMessage('Amount must be greater than 0'),

  body('dueDate')
    .isISO8601().withMessage('Due date must be a valid date')
    .custom((value: string) => {
      const dueDate = new Date(value);
      const today = new Date();
      if (dueDate < today) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),

  body('status')
    .isIn(['PENDING', 'SUBMITTED', 'RETURNED']).withMessage('Invalid EMD status'),

  body('documentPath')
    .optional()
    .isString().withMessage('Document path must be a string')
    .isLength({ max: 255 }).withMessage('Document path is too long'),

  handleValidationResult
];

// Common query parameter validations
export const validateListQuery: (ValidationChain | ValidationMiddleware)[] = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date')
    .custom((endDate: string, { req }) => {
      if (req.query && req.query.startDate && new Date(endDate) < new Date(req.query.startDate as string)) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    }),

  query('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']).withMessage('Invalid status'),

  handleValidationResult
];

// Status update validation
export const validateStatusUpdate: (ValidationChain | ValidationMiddleware)[] = [
  param('id')
    .isUUID().withMessage('Invalid ID format'),

  body('status')
    .isString().withMessage('Status must be a string')
    .isIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']).withMessage('Invalid status'),

  handleValidationResult
];

// ID parameter validation
export const validateIdParam: (ValidationChain | ValidationMiddleware)[] = [
  param('id')
    .isUUID().withMessage('Invalid ID format'),

  handleValidationResult
];

export const validateEMDSubmission = [
  body('offerId')
    .notEmpty().withMessage('Offer ID is required')
    .isUUID().withMessage('Invalid offer ID'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid date')
    .custom((value: string) => {
      const dueDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),

  body('documentPath')
    .optional()
    .isString().withMessage('Document path must be a string')
];

  // src/middleware/validation.ts
  export const validatePurchaseOrder: (ValidationChain | ValidationMiddleware)[] = [
    body('loaId')
        .notEmpty().withMessage('LOA ID is required')
        .isUUID().withMessage('Invalid LOA ID format'),

    body('vendorId')
        .notEmpty().withMessage('Vendor ID is required')
        .isUUID().withMessage('Invalid vendor ID'),

    body('value')
        .notEmpty().withMessage('Value is required')
        .isNumeric().withMessage('Value must be a number')
        .isFloat({ min: 0 }).withMessage('Value must be greater than 0'),

    body('deliveryDate')
        .notEmpty().withMessage('Delivery date is required')
        .isISO8601().withMessage('Invalid date format'),

    body('items')
        .isArray().withMessage('Items must be an array')
        .notEmpty().withMessage('At least one item is required'),

    body('items.*.itemId')
        .notEmpty().withMessage('Item ID is required')
        .isUUID().withMessage('Invalid item ID'),

    body('items.*.quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

    body('items.*.unitPrice')
        .notEmpty().withMessage('Unit price is required')
        .isFloat({ min: 0 }).withMessage('Unit price must be positive'),

    handleValidationResult
];


export const validatePOUpdate: (ValidationChain | ValidationMiddleware)[] = [
  body('value')
      .optional()
      .isNumeric().withMessage('Value must be a number')
      .isFloat({ min: 0 }).withMessage('Value must be greater than 0'),

  body('deliveryDate')
      .optional()
      .isISO8601().withMessage('Invalid date format')
      .custom((value: string) => {
          const deliveryDate = new Date(value);
          const today = new Date();
          if (deliveryDate < today) {
              throw new Error('Delivery date cannot be in the past');
          }
          return true;
      }),

  body('items')
      .optional()
      .isArray().withMessage('Items must be an array'),

  body('items.*.itemId')
      .optional()
      .isUUID().withMessage('Invalid item ID'),

  body('items.*.quantity')
      .optional()
      .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('items.*.unitPrice')
      .optional()
      .isFloat({ min: 0 }).withMessage('Unit price must be positive'),

  body('items.*.specifications')
      .optional()
      .isObject().withMessage('Specifications must be an object'),

  handleValidationResult
];

//   export const validatePurchaseOrder: (ValidationChain | ValidationMiddleware)[] = [
//     body('loaId')
//         .notEmpty().withMessage('LOA ID is required')
//         .isUUID().withMessage('Invalid LOA ID format')
//         .custom(async (loaId: string) => {
//             const loa = await prisma.lOA.findUnique({
//                 where: { id: loaId }
//             });
            
//             if (!loa) {
//                 throw new Error('LOA not found');
//             }
            
//             if (loa.status !== 'ACTIVE') {
//                 throw new Error('LOA is not active');
//             }
            
//             return true;
//         }),

//     body('vendorId')
//         .notEmpty().withMessage('Vendor ID is required')
//         .isUUID().withMessage('Invalid vendor ID')
//         .custom(async (vendorId: string) => {
//             const vendor = await prisma.vendor.findUnique({
//                 where: { id: vendorId }
//             });
            
//             if (!vendor) {
//                 throw new Error('Vendor not found');
//             }
            
//             if (vendor.status !== 'ACTIVE') {
//                 throw new Error('Vendor is not active');
//             }
            
//             return true;
//         }),

//     body('value')
//         .notEmpty().withMessage('Value is required')
//         .isNumeric().withMessage('Value must be a number')
//         .isFloat({ min: 0 }).withMessage('Value must be greater than 0')
//         .custom(async (value: number, { req }) => {
//             const loaId = req.body.loaId;
//             if (!loaId) return true;

//             const loa = await prisma.lOA.findUnique({
//                 where: { id: loaId },
//                 include: {
//                     amendments: {
//                         where: { status: 'APPROVED' }
//                     },
//                     purchaseOrders: {
//                         where: {
//                             status: { notIn: ['CANCELLED'] }
//                         }
//                     }
//                 }
//             });

//             if (loa) {
//                 const totalAmendments = loa.amendments.reduce(
//                     (sum, amendment) => sum + Number(amendment.additionalValue),
//                     0
//                 );
                
//                 const totalValue = Number(loa.value) + totalAmendments;
//                 const usedValue = loa.purchaseOrders.reduce(
//                     (sum, po) => sum + Number(po.value),
//                     0
//                 );
//                 const remainingValue = totalValue - usedValue;
                
//                 if (value > remainingValue) {
//                     throw new Error(`PO value exceeds remaining LOA value. Available: ${remainingValue}`);
//                 }
//             }
            
//             return true;
//         }),

//     body('deliveryDate')
//         .notEmpty().withMessage('Delivery date is required')
//         .isISO8601().withMessage('Invalid date format')
//         .custom(async (value: string, { req }) => {
//             const deliveryDate = new Date(value);
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             if (deliveryDate < today) {
//                 throw new Error('Delivery date cannot be in the past');
//             }

//             const loaId = req.body.loaId;
//             if (loaId) {
//                 const loa = await prisma.lOA.findUnique({
//                     where: { id: loaId }
//                 });

//                 if (loa && deliveryDate > new Date(loa.validityPeriod)) {
//                     throw new Error('Delivery date cannot be after LOA validity period');
//                 }
//             }

//             return true;
//         }),

//     body('items')
//         .isArray().withMessage('Items must be an array')
//         .notEmpty().withMessage('At least one item is required'),

//     body('items.*.itemId')
//         .notEmpty().withMessage('Item ID is required')
//         .isUUID().withMessage('Invalid item ID')
//         .custom(async (itemId: string) => {
//             const item = await prisma.itemMaster.findUnique({
//                 where: { id: itemId }
//             });
            
//             if (!item) {
//                 throw new Error('Item not found');
//             }
            
//             if (!item.isActive) {
//                 throw new Error('Item is not active');
//             }
            
//             return true;
//         }),

//     body('items.*.quantity')
//         .notEmpty().withMessage('Quantity is required')
//         .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

//     body('items.*.unitPrice')
//         .notEmpty().withMessage('Unit price is required')
//         .isFloat({ min: 0 }).withMessage('Unit price must be positive'),

//     body('items.*.specifications')
//         .optional()
//         .isObject().withMessage('Specifications must be an object'),

//     handleValidationResult
// ];

  export const validateItemData = [
    body('itemCode')
        .notEmpty().withMessage('Item code is required')
        .matches(/^[A-Z0-9-]+$/).withMessage('Invalid item code format'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 3 }).withMessage('Description too short'),
    
    body('category')
        .notEmpty().withMessage('Category is required'),
    
    body('unit')
        .notEmpty().withMessage('Unit is required'),
    
    body('specifications')
        .isArray().withMessage('Specifications must be an array')
        .optional(),
    
    body('specifications.*.key')
        .notEmpty().withMessage('Specification key is required'),
    
    body('specifications.*.value')
        .notEmpty().withMessage('Specification value is required'),
    
    handleValidationResult
];

export const validateVendorStatus = [
  body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(Object.values(VendorStatus))
      .withMessage(`Status must be one of: ${Object.values(VendorStatus).join(', ')}`),

  body('remarks')
      .optional()
      .isString().withMessage('Remarks must be a string')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Remarks must be between 10 and 500 characters'),

  handleValidationResult
];

export const validateVendorData = [
    body('vendorCode')
        .notEmpty().withMessage('Vendor code is required')
        .matches(/^[A-Z0-9-]+$/).withMessage('Invalid vendor code format'),
    
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 3 }).withMessage('Name too short'),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    
    body('phone')
        .notEmpty().withMessage('Phone is required')
        .matches(/^\+?[\d\s-]{10,}$/).withMessage('Invalid phone format'),
    
    body('address')
        .notEmpty().withMessage('Address is required'),
    
    body('city')
        .notEmpty().withMessage('City is required'),
    
    body('state')
        .notEmpty().withMessage('State is required'),
    
    body('country')
        .notEmpty().withMessage('Country is required'),
    
    body('pinCode')
        .notEmpty().withMessage('PIN code is required')
        .matches(/^\d{6}$/).withMessage('Invalid PIN code'),
    
    body('category')
        .isArray().withMessage('Category must be an array')
        .notEmpty().withMessage('At least one category is required'),
    
    body('category.*')
        .isIn(Object.values(VendorCategory)).withMessage('Invalid vendor category'),
    
    handleValidationResult
];

// Export all validations
export const Validators = {
  budgetaryOffer: validateBudgetaryOffer,
  emdTracking: validateEMDTracking,
  loa: validateLOA,
  loaAmendment: validateLOAAmendment,
  listQuery: validateListQuery,
  statusUpdate: validateStatusUpdate,
  idParam: validateIdParam,
};