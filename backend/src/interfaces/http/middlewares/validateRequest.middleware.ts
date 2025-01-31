import { Request, Response, NextFunction } from 'express';
import { Result } from '../../../shared/types/common.types';

interface ValidationError {
  field: string;
  message: string;
}

type ValidatorFunction = (data: any) => Result<ValidationError[]>;

export const validateRequest = (
  validatorFn: ValidatorFunction,
  validateFile: boolean = false
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Prepare data for validation
      const dataToValidate = {
        ...req.body,
        ...(validateFile && req.file && { documentFile: req.file })
      };

      // Run validation
      const validationResult = await validatorFn(dataToValidate);

      // Check for validation errors
      if (validationResult.isSuccess && validationResult.data && validationResult.data.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationResult.data.map(error => ({
            field: error.field,
            message: error.message
          }))
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Validation processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};
