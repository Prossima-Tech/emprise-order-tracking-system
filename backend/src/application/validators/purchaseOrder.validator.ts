// application/validators/purchaseOrder.validator.ts
import { Result, ResultUtils } from '../../shared/types/common.types';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from '../dtos/purchaseOrder/PurchaseOrderDto';
import { POStatus } from '../../domain/entities/constants';

interface ValidationError {
  field: string;
  message: string;
}

export class PurchaseOrderValidator {
  validate(dto: CreatePurchaseOrderDto): Result<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate LOA ID
    if (!dto.loaId) {
      errors.push({ field: 'loaId', message: 'LOA reference is required' });
    }

    // Validate Vendor ID
    if (!dto.vendorId) {
      errors.push({ field: 'vendorId', message: 'Vendor is required' });
    }

    // Validate Items
    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      errors.push({ field: 'items', message: 'At least one item is required' });
    } else {
      dto.items.forEach((item, index) => {
        if (!item.itemId) {
          errors.push({ field: `items[${index}].itemId`, message: 'Item ID is required' });
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push({ field: `items[${index}].quantity`, message: 'Quantity must be a positive number' });
        }
      });
    }

    // Validate Requirement Description
    if (!dto.requirementDesc?.trim()) {
      errors.push({ field: 'requirementDesc', message: 'Requirement description is required' });
    } else if (dto.requirementDesc.length < 10 || dto.requirementDesc.length > 1000) {
      errors.push({ field: 'requirementDesc', message: 'Requirement description must be between 10 and 1000 characters' });
    }

    // Validate Terms and Conditions
    if (!dto.termsConditions?.trim()) {
      errors.push({ field: 'termsConditions', message: 'Terms and conditions are required' });
    } else if (dto.termsConditions.length < 10 || dto.termsConditions.length > 2000) {
      errors.push({ field: 'termsConditions', message: 'Terms and conditions must be between 10 and 2000 characters' });
    }

    // Validate Ship to Address
    if (!dto.shipToAddress?.trim()) {
      errors.push({ field: 'shipToAddress', message: 'Shipping address is required' });
    } else if (dto.shipToAddress.length < 10 || dto.shipToAddress.length > 500) {
      errors.push({ field: 'shipToAddress', message: 'Shipping address must be between 10 and 500 characters' });
    }

    // Validate Tags
    if (dto.tags && !Array.isArray(dto.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    }

    return errors.length === 0 ? ResultUtils.ok([]) : ResultUtils.ok(errors);
  }

  validateUpdate(dto: UpdatePurchaseOrderDto): Result<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate Requirement Description if provided
    if (dto.requirementDesc !== undefined) {
      if (!dto.requirementDesc.trim()) {
        errors.push({ field: 'requirementDesc', message: 'Requirement description cannot be empty' });
      } else if (dto.requirementDesc.length < 10 || dto.requirementDesc.length > 1000) {
        errors.push({ field: 'requirementDesc', message: 'Requirement description must be between 10 and 1000 characters' });
      }
    }

    // Validate Terms and Conditions if provided
    if (dto.termsConditions !== undefined) {
      if (!dto.termsConditions.trim()) {
        errors.push({ field: 'termsConditions', message: 'Terms and conditions cannot be empty' });
      } else if (dto.termsConditions.length < 10 || dto.termsConditions.length > 2000) {
        errors.push({ field: 'termsConditions', message: 'Terms and conditions must be between 10 and 2000 characters' });
      }
    }

    // Validate Ship to Address if provided
    if (dto.shipToAddress !== undefined) {
      if (!dto.shipToAddress.trim()) {
        errors.push({ field: 'shipToAddress', message: 'Shipping address cannot be empty' });
      } else if (dto.shipToAddress.length < 10 || dto.shipToAddress.length > 500) {
        errors.push({ field: 'shipToAddress', message: 'Shipping address must be between 10 and 500 characters' });
      }
    }

    // Validate Status if provided
    if (dto.status && !Object.values(POStatus).includes(dto.status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    }

    // Validate Tags if provided
    if (dto.tags && !Array.isArray(dto.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    }

    return errors.length === 0 ? ResultUtils.ok([]) : ResultUtils.ok(errors);
  }

  validateId(id: string): Result<ValidationError[]> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id) 
      ? ResultUtils.ok([]) 
      : ResultUtils.ok([{ field: 'id', message: 'Invalid ID format' }]);
  }
}