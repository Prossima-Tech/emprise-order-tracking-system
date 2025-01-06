// src/utils/errorHandler.ts
import { message } from 'antd';

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export const errorHandler = {
  handle(error: any) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    
    // Log error to monitoring service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error);
    }

    // Show user-friendly error message
    message.error({
      content: errorMessage,
      className: 'error-message',
    });

    return errorMessage;
  },

  isNetworkError(error: any): boolean {
    return !error.response && error.message === 'Network Error';
  },

  isValidationError(error: any): boolean {
    return error.response?.status === 422;
  },

  getValidationErrors(error: any): Record<string, string> {
    if (!this.isValidationError(error)) {
      return {};
    }

    const { errors = {} } = error.response?.data as ErrorResponse;
    return Object.keys(errors).reduce((acc, key) => {
      acc[key] = errors[key][0];
      return acc;
    }, {} as Record<string, string>);
  },
};