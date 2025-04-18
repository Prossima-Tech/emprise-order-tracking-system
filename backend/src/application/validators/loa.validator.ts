// application/validators/loa.validator.ts
import { Result, ResultUtils } from '../../shared/types/common.types';
import { CreateLoaDto } from '../dtos/loa/CreateLoaDto';
import { CreateAmendmentDto  } from '../dtos/loa/CreateAmendmentDto';
import { UpdateStatusDto } from '../dtos/loa/UpdateStatusDto';

interface ValidationError {
  field: string;
  message: string;
}

export class LoaValidator {
  validate(dto: CreateLoaDto): Result<ValidationError[]> {
    const errors: ValidationError[] = [];

    // LOA Number validation
    if (!dto.loaNumber?.trim()) {
      errors.push({ field: 'loaNumber', message: 'LOA number is required' });
    } else if (dto.loaNumber.length < 3 || dto.loaNumber.length > 50) {
      errors.push({ field: 'loaNumber', message: 'LOA number must be between 3 and 50 characters' });
    }

    if (!dto.siteId) {
      errors.push({ field: 'siteId', message: 'Site is required' });
    }

    // LOA Value validation
    if (!dto.loaValue || dto.loaValue <= 0) {
      errors.push({ field: 'loaValue', message: 'LOA value must be a positive number' });
    }

    // Delivery Period validation
    if (!dto.deliveryPeriod) {
      errors.push({ field: 'deliveryPeriod', message: 'Delivery period is required' });
    } else {
      try {
        const startDate = new Date(dto.deliveryPeriod.start);
        const endDate = new Date(dto.deliveryPeriod.end);
        
        if (isNaN(startDate.getTime())) {
          errors.push({ field: 'deliveryPeriod.start', message: 'Invalid start date' });
        }
        if (isNaN(endDate.getTime())) {
          errors.push({ field: 'deliveryPeriod.end', message: 'Invalid end date' });
        }
        if (startDate >= endDate) {
          errors.push({ field: 'deliveryPeriod', message: 'Start date must be before end date' });
        }
      } catch (error) {
        errors.push({ field: 'deliveryPeriod', message: 'Invalid delivery period format' });
      }
    }

    // Work Description validation
    if (!dto.workDescription?.trim()) {
      errors.push({ field: 'workDescription', message: 'Work description is required' });
    } else if (dto.workDescription.length < 10 || dto.workDescription.length > 1000) {
      errors.push({ field: 'workDescription', message: 'Work description must be between 10 and 1000 characters' });
    }

    // Tags validation - simplified
    if (dto.tags && !Array.isArray(dto.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    }

    // EMD validation - simplified
    if (dto.hasEmd === true && dto.emdAmount !== undefined && dto.emdAmount <= 0) {
      errors.push({ field: 'emdAmount', message: 'EMD amount must be a positive number when EMD is enabled' });
    }

    // Security Deposit validation - simplified
    if (dto.hasSecurityDeposit === true && dto.securityDepositAmount !== undefined && dto.securityDepositAmount <= 0) {
      errors.push({ field: 'securityDepositAmount', message: 'Security deposit amount must be a positive number when security deposit is enabled' });
    }

    // Performance Guarantee validation - simplified
    if (dto.hasPerformanceGuarantee === true && dto.performanceGuaranteeAmount !== undefined && dto.performanceGuaranteeAmount <= 0) {
      errors.push({ field: 'performanceGuaranteeAmount', message: 'Performance guarantee amount must be a positive number when performance guarantee is enabled' });
    }

    return errors.length === 0 ? ResultUtils.ok([]) : ResultUtils.ok(errors);
  }

  validateAmendment(dto: CreateAmendmentDto): Result<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Amendment Number validation
    if (!dto.amendmentNumber?.trim()) {
      errors.push({ field: 'amendmentNumber', message: 'Amendment number is required' });
    } else if (dto.amendmentNumber.length < 3 || dto.amendmentNumber.length > 50) {
      errors.push({ field: 'amendmentNumber', message: 'Amendment number must be between 3 and 50 characters' });
    }

    // Tags validation
    if (dto.tags && !Array.isArray(dto.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    }

    return errors.length === 0 ? ResultUtils.ok([]) : ResultUtils.ok(errors);
  }

  validateStatusUpdate(dto: UpdateStatusDto): Result<ValidationError[]> {
    const errors: ValidationError[] = [];
    const validStatuses = ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DELAYED'];

    if (!dto.status) {
      errors.push({ field: 'status', message: 'Status is required' });
    } else if (!validStatuses.includes(dto.status)) {
      errors.push({ 
        field: 'status', 
        message: `Status must be one of: ${validStatuses.join(', ')}` 
      });
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