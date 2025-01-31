// shared/types/common.types.ts

export interface Result<T> {
  isSuccess: boolean;
  data?: T;
  error?: string | ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export class ResultUtils {
  static ok<T>(data: T): Result<T> {
    return {
      isSuccess: true,
      data
    };
  }

  static fail<T>(error: string, data?: ValidationError[]): Result<T> {
    return {
      isSuccess: false,
      error,
      data: data as any // Only for validation errors
    };
  }
}