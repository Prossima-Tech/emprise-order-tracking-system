// frontend/utils/transforms.ts
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };
  
  export const parseDecimal = (value: string | number) => {
    return Number(value);
  };