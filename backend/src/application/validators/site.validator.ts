// application/validators/site.validator.ts
import { Result, ResultUtils } from '../../shared/types/common.types';
import { CreateSiteDto, UpdateSiteDto } from '../dtos/site/SiteDto';
import { SiteStatus } from '../../domain/entities/constants';
// import { RAILWAY_ZONES } from '../../domain/entities/constants/railway';

interface ValidationError {
  field: string;
  message: string;
}

export class SiteValidator {
  validate(dto: CreateSiteDto): Result<ValidationError[]> {
    console.log('Validating site data:', dto);
    const errors: ValidationError[] = [];

    // Validate name
    if (!dto.name?.trim()) {
      errors.push({ field: 'name', message: 'Site name is required' });
    } else if (dto.name.length < 3 || dto.name.length > 100) {
      errors.push({ field: 'name', message: 'Site name must be between 3 and 100 characters' });
    }

    // Validate location
    if (!dto.location?.trim()) {
      errors.push({ field: 'location', message: 'Location is required' });
    }

    // Validate zoneId
    if (!dto.zoneId?.trim()) {
      errors.push({ field: 'zoneId', message: 'Railway zone is required' });
    }
    // Removed the check for valid railway zone IDs since they now come from the database

    // Validate address
    if (!dto.address?.trim()) {
      errors.push({ field: 'address', message: 'Address is required' });
    } else if (dto.address.length < 10 || dto.address.length > 500) {
      errors.push({ field: 'address', message: 'Address must be between 10 and 500 characters' });
    }

    // Validate contact email if provided
    if (dto.contactEmail && !this.isValidEmail(dto.contactEmail)) {
      errors.push({ field: 'contactEmail', message: 'Invalid email format' });
    }

    // Validate contact phone if provided
    if (dto.contactPhone && !this.isValidPhone(dto.contactPhone)) {
      errors.push({ field: 'contactPhone', message: 'Invalid phone number format' });
    }

    // Validate tags
    if (dto.tags && !Array.isArray(dto.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    }

    if (errors.length > 0) {
      console.log('Validation errors found:', errors);
    }

    return errors.length === 0 ? ResultUtils.ok([]) : ResultUtils.ok(errors);
  }

  validateUpdate(dto: UpdateSiteDto): Result<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate name if provided
    if (dto.name !== undefined) {
      if (!dto.name.trim()) {
        errors.push({ field: 'name', message: 'Site name cannot be empty' });
      } else if (dto.name.length < 3 || dto.name.length > 100) {
        errors.push({ field: 'name', message: 'Site name must be between 3 and 100 characters' });
      }
    }

    // Validate location if provided
    if (dto.location !== undefined && !dto.location.trim()) {
      errors.push({ field: 'location', message: 'Location cannot be empty' });
    }

    // Validate zoneId if provided
    if (dto.zoneId !== undefined) {
      if (!dto.zoneId.trim()) {
        errors.push({ field: 'zoneId', message: 'Railway zone cannot be empty' });
      }
      // Removed the check for valid railway zone IDs since they now come from the database
    }

    // Validate address if provided
    if (dto.address !== undefined) {
      if (!dto.address.trim()) {
        errors.push({ field: 'address', message: 'Address cannot be empty' });
      } else if (dto.address.length < 10 || dto.address.length > 500) {
        errors.push({ field: 'address', message: 'Address must be between 10 and 500 characters' });
      }
    }

    // Validate contact email if provided
    if (dto.contactEmail && !this.isValidEmail(dto.contactEmail)) {
      errors.push({ field: 'contactEmail', message: 'Invalid email format' });
    }

    // Validate contact phone if provided
    if (dto.contactPhone && !this.isValidPhone(dto.contactPhone)) {
      errors.push({ field: 'contactPhone', message: 'Invalid phone number format' });
    }

    // Validate status if provided
    if (dto.status && !Object.values(SiteStatus).includes(dto.status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    }

    return errors.length === 0 ? ResultUtils.ok([]) : ResultUtils.ok(errors);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  }
}