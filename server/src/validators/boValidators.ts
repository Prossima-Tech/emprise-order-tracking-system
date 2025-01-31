import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { BudgetaryOfferStatus, EMDPaymentMode } from '../types/budgetaryOffer';

export class BudgetaryOfferValidators {
  /**
   * Validates creation and update of budgetary offers
   */
  static validateBudgetaryOffer = [
    // Basic offer details
    body('offerId')
      .notEmpty()
      .withMessage('Offer ID is required')
      .matches(/^BO-\d{6}$/)
      .withMessage('Offer ID must be in format BO-YYMMDD'),

    body('offerDate')
      .isISO8601()
      .withMessage('Offer date must be a valid date')
      .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        if (date > now) {
          throw new Error('Offer date cannot be in the future');
        }
        return true;
      }),

    body('fromAuthority')
      .trim()
      .notEmpty()
      .withMessage('From Authority is required')
      .isLength({ max: 100 })
      .withMessage('From Authority must not exceed 100 characters'),

    body('toAuthority')
      .trim()
      .notEmpty()
      .withMessage('To Authority is required')
      .isLength({ max: 100 })
      .withMessage('To Authority must not exceed 100 characters'),

    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 200 })
      .withMessage('Subject must not exceed 200 characters'),

    // Work Items validation
    body('workItems')
      .isArray()
      .withMessage('Work items must be an array')
      .notEmpty()
      .withMessage('At least one work item is required'),

    body('workItems.*.description')
      .trim()
      .notEmpty()
      .withMessage('Work item description is required')
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),

    body('workItems.*.quantity')
      .isFloat({ min: 0.01 })
      .withMessage('Quantity must be a positive number'),

    body('workItems.*.unitOfMeasurement')
      .trim()
      .notEmpty()
      .withMessage('Unit of measurement is required')
      .isLength({ max: 50 })
      .withMessage('Unit of measurement must not exceed 50 characters'),

    body('workItems.*.baseRate')
      .isFloat({ min: 0.01 })
      .withMessage('Base rate must be a positive number'),

    body('workItems.*.taxRate')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Tax rate must be between 0 and 100'),

    // EMD Details validation
    body('emdDetails.amount')
      .isFloat({ min: 0.01 })
      .withMessage('EMD amount must be a positive number')
      .custom((value, { req }) => {
        const workItems = req.body.workItems || [];
        const totalValue = workItems.reduce((sum: number, item: any) => {
          return sum + (item.baseRate * item.quantity * (1 + item.taxRate / 100));
        }, 0);
        
        if (value > totalValue * 0.05) {
          throw new Error('EMD amount cannot exceed 5% of total project value');
        }
        return true;
      }),

    body('emdDetails.paymentMode')
      .isIn([EMDPaymentMode.FDR])
      .withMessage('Payment mode must be FDR'),

    body('emdDetails.submissionDate')
      .isISO8601()
      .withMessage('Submission date must be a valid date'),

    body('emdDetails.bankName')
      .trim()
      .notEmpty()
      .withMessage('Bank name is required')
      .isLength({ max: 100 })
      .withMessage('Bank name must not exceed 100 characters')
      .custom((value) => {
        if (value.toUpperCase() !== 'IDBI') {
          throw new Error('Only IDBI bank is allowed');
        }
        return true;
      }),

    // Terms and conditions
    body('termsAndConditions')
      .notEmpty()
      .withMessage('Terms and conditions are required'),

    // Approvers validation
    body('approvers')
      .isArray()
      .withMessage('Approvers must be an array')
      .notEmpty()
      .withMessage('At least one approver is required'),

    body('approvers.*')
      .isUUID()
      .withMessage('Invalid approver ID format'),

    // Status validation
    body('status')
      .optional()
      .isIn(Object.values(BudgetaryOfferStatus))
      .withMessage('Invalid status')
  ];

  /**
   * Validates approval action
   */
  static validateApprovalAction = [
    body('approve')
      .isBoolean()
      .withMessage('Approve must be a boolean value'),

    body('remarks')
      .if(body('approve').equals('false'))
      .notEmpty()
      .withMessage('Remarks are required when rejecting')
      .isLength({ max: 500 })
      .withMessage('Remarks must not exceed 500 characters'),
  ];

  /**
   * Validates query parameters
   */
  static validateListQuery = [
    query('status')
      .optional()
      .isIn(Object.values(BudgetaryOfferStatus))
      .withMessage('Invalid status'),

    query('fromDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid from date'),

    query('toDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid to date')
      .custom((value, { req }) => {
        if ((req as Request).query.fromDate && value) {
          const fromDate = new Date((req as Request).query.fromDate as string);
          const toDate = new Date(value);
          if (fromDate > toDate) {
            throw new Error('To date must be after from date');
          }
        }
        return true;
      }),

    query('offerId')
      .optional()
      .matches(/^BO-\d{6}$/)
      .withMessage('Invalid offer ID format'),

    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('pendingApprovalFor')
      .optional()
      .isUUID()
      .withMessage('Invalid user ID format'),
  ];

  /**
   * Validates ID parameter
   */
  static validateIdParam = [
    param('id')
      .isUUID()
      .withMessage('Invalid offer ID format')
  ];

  /**
   * Middleware to handle validation errors
   */
  static handleValidationErrors(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.msg,
          message: err.msg
        }))
      });
      return;
    }
    next();
  }
}