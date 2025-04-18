import { Result, ResultUtils } from '../../shared/types/common.types';
import { CreateBudgetaryOfferDto } from '../dtos/budgetaryOffer/CreateBudgetaryOfferDto';
import { BudgetaryOffer, WorkItem } from '../../domain/entities/BudgetaryOffer';
import { getAllZoneIds } from '../../domain/entities/constants/railway';

interface ValidationError {
  field: string;
  message: string;
}

export class BudgetaryOfferValidator {
  
  validate(dto: CreateBudgetaryOfferDto): Result<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate required fields existence
    if (!dto) {
      return ResultUtils.fail('Budgetary offer data is required');
    }

    // Offer Date Validation
    if (!dto.offerDate) {
      errors.push({
        field: 'offerDate',
        message: 'Offer date is required'
      });
    } else if (!this.isValidOfferDate(dto.offerDate)) {
      errors.push({
        field: 'offerDate',
        message: 'Offer date must be a valid date not in the past'
      });
    }

    // Authority Validation
    if (!dto.toAuthority) {
      errors.push({
        field: 'toAuthority',
        message: 'Authority is required'
      });
    } else if (!this.isValidAuthority(dto.toAuthority)) {
      errors.push({
        field: 'toAuthority',
        message: 'Authority must be between 3 and 200 characters'
      });
    }

    // Subject Validation
    if (!dto.subject) {
      errors.push({
        field: 'subject',
        message: 'Subject is required'
      });
    } else if (!this.isValidSubject(dto.subject)) {
      errors.push({
        field: 'subject',
        message: 'Subject must be between 10 and 500 characters'
      });
    }

    // Work Items Validation
    const workItemsValidation = this.validateWorkItems(dto.workItems);
    if (!workItemsValidation.isSuccess && workItemsValidation.data) {
      errors.push(...workItemsValidation.data);
    }

    // Terms and Conditions Validation
    if (!dto.termsConditions) {
      errors.push({
        field: 'termsConditions',
        message: 'Terms and conditions are required'
      });
    } else if (!this.isValidTermsConditions(dto.termsConditions)) {
      errors.push({
        field: 'termsConditions',
        message: 'Terms and conditions must be between 10 and 2000 characters'
      });
    }

    // Approver ID Validation
    if (dto.approverId && !this.isValidApproverId(dto.approverId)) {
      errors.push({
        field: 'approverId',
        message: 'Invalid approver ID format'
      });
    }

    // Tags Validation
    if (!this.isValidTags(dto.tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array of strings'
      });
    }

    // Customer Validation
    if (!dto.customerId) {
      errors.push({
        field: 'customerId',
        message: 'Customer is required'
      });
    }

    return errors.length === 0 
      ? ResultUtils.ok([])
      : ResultUtils.ok(errors);
  }

  private validateWorkItems(workItems: WorkItem[]): Result<ValidationError[]> {
    const errors: ValidationError[] = [];

    if (!Array.isArray(workItems) || workItems.length === 0) {
      return ResultUtils.ok([{
        field: 'workItems',
        message: 'At least one work item is required'
      }]);
    }

    workItems.forEach((item, index) => {
      // Description
      if (!item.description) {
        errors.push({
          field: `workItems[${index}].description`,
          message: 'Description is required'
        });
      } else if (item.description.trim().length < 5 || item.description.trim().length > 500) {
        errors.push({
          field: `workItems[${index}].description`,
          message: 'Description must be between 5 and 500 characters'
        });
      }

      // Quantity
      if (item.quantity === undefined || item.quantity === null) {
        errors.push({
          field: `workItems[${index}].quantity`,
          message: 'Quantity is required'
        });
      } else if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        errors.push({
          field: `workItems[${index}].quantity`,
          message: 'Quantity must be a positive number'
        });
      }

      // Unit of Measurement
      if (!item.unitOfMeasurement) {
        errors.push({
          field: `workItems[${index}].unitOfMeasurement`,
          message: 'Unit of measurement is required'
        });
      } else if (item.unitOfMeasurement.trim().length < 1) {
        errors.push({
          field: `workItems[${index}].unitOfMeasurement`,
          message: 'Unit of measurement cannot be empty'
        });
      }

      // Base Rate
      if (item.baseRate === undefined || item.baseRate === null) {
        errors.push({
          field: `workItems[${index}].baseRate`,
          message: 'Base rate is required'
        });
      } else if (!Number.isFinite(item.baseRate) || item.baseRate <= 0) {
        errors.push({
          field: `workItems[${index}].baseRate`,
          message: 'Base rate must be a positive number'
        });
      }

      // Tax Rate
      if (item.taxRate === undefined || item.taxRate === null) {
        errors.push({
          field: `workItems[${index}].taxRate`,
          message: 'Tax rate is required'
        });
      } else if (!Number.isFinite(item.taxRate) || item.taxRate < 0 || item.taxRate > 100) {
        errors.push({
          field: `workItems[${index}].taxRate`,
          message: 'Tax rate must be between 0 and 100'
        });
      }
    });

    return ResultUtils.ok(errors);
  }

  private isValidOfferDate(date: string): boolean {
    try {
      const offerDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return offerDate instanceof Date && 
             !isNaN(offerDate.getTime()) && 
             offerDate >= today;
    } catch {
      return false;
    }
  }

  private isValidAuthority(authority: string): boolean {
    return authority.trim().length >= 3 && authority.trim().length <= 200;
  }

  private isValidSubject(subject: string): boolean {
    return subject.trim().length >= 10 && subject.trim().length <= 500;
  }

  private isValidTermsConditions(terms: string): boolean {
    return terms.trim().length >= 10 && terms.trim().length <= 2000;
  }

  private isValidApproverId(approverId: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(approverId);
  }

  private isValidTags(tags: any): boolean {
    if (!Array.isArray(tags)) return false;
    return tags.every(tag => typeof tag === 'string' && tag.trim().length > 0);
  }
}