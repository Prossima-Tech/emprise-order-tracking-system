// application/validators/emd.validator.ts
import { Result, ResultUtils } from '../../shared/types/common.types';
import { CreateEmdDto } from '../dtos/emd/CreateEmdDto';
import { EMDStatus } from '@prisma/client';
import { UpdateEmdDto } from '../dtos/emd/UpdateEmdDto';

interface ValidationError {
  field: string;
  message: string;
}

export class EMDValidator {
  validate(dto: CreateEmdDto): Result<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Amount validation
    if (!dto.amount || dto.amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be a positive number' });
    }

    // Submission Date validation
    if (!dto.submissionDate) {
      errors.push({ field: 'submissionDate', message: 'Submission date is required' });
    } else {
      const submissionDate = new Date(dto.submissionDate);
      if (isNaN(submissionDate.getTime())) {
        errors.push({ field: 'submissionDate', message: 'Invalid submission date format' });
      }
    }

    // Maturity Date validation
    if (!dto.maturityDate) {
      errors.push({ field: 'maturityDate', message: 'Maturity date is required' });
    } else {
      const maturityDate = new Date(dto.maturityDate);
      const submissionDate = new Date(dto.submissionDate);

      if (isNaN(maturityDate.getTime())) {
        errors.push({ field: 'maturityDate', message: 'Invalid maturity date format' });
      } else if (submissionDate >= maturityDate) {
        errors.push({ field: 'maturityDate', message: 'Maturity date must be after submission date' });
      }
    }

    // Bank Name validation (if provided)
    if (dto.bankName && (dto.bankName.length < 2 || dto.bankName.length > 100)) {
      errors.push({ field: 'bankName', message: 'Bank name must be between 2 and 100 characters' });
    }

    // Tags validation
    if (dto.tags && !Array.isArray(dto.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    }

    return errors.length === 0 ? ResultUtils.ok([]) : ResultUtils.ok(errors);
  }

  validateUpdate(dto: UpdateEmdDto): Result<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Amount validation if provided
    if (dto.amount !== undefined && dto.amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be a positive number' });
    }

    // Date validations if provided
    if (dto.submissionDate && dto.maturityDate) {
      const submissionDate = new Date(dto.submissionDate);
      const maturityDate = new Date(dto.maturityDate);

      if (submissionDate >= maturityDate) {
        errors.push({ field: 'maturityDate', message: 'Maturity date must be after submission date' });
      }
    }

    // Status validation if provided
    if (dto.status && !Object.values(EMDStatus).includes(dto.status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    }

    // Tags validation if provided
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