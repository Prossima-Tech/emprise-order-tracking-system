import { TaxRates } from "../Item";

export const calculateTotalAmount = (
    quantity: number,
    unitPrice: number,
    taxRates: TaxRates
  ): number => {
    const baseAmount = quantity * unitPrice;
    const taxAmount = baseAmount * (
      (taxRates.igst || 0) / 100 +
      (taxRates.sgst || 0) / 100 +
      (taxRates.ugst || 0) / 100
    );
    return baseAmount + taxAmount;
  };
  
  export const calculateTaxAmount = (
    baseAmount: number,
    taxRates: TaxRates
  ): { 
    igstAmount: number;
    sgstAmount: number;
    ugstAmount: number;
    totalTax: number;
  } => {
    const igstAmount = baseAmount * ((taxRates.igst || 0) / 100);
    const sgstAmount = baseAmount * ((taxRates.sgst || 0) / 100);
    const ugstAmount = baseAmount * ((taxRates.ugst || 0) / 100);
    
    return {
      igstAmount,
      sgstAmount,
      ugstAmount,
      totalTax: igstAmount + sgstAmount + ugstAmount
    };
  };