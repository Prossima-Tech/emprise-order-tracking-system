// src/utils/decimal.ts
export const toNumber = (value: any): number => {
    if (value === null || value === undefined) {
      return 0;
    }
    
    // If it's already a number, return it
    if (typeof value === 'number') {
      return value;
    }
  
    // If it's a string or has toString method
    if (value.toString) {
      return Number(value.toString()) || 0;
    }
  
    return 0;
  };