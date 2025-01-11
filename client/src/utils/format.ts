// src/utils/format.ts

/**
 * Formats a number as Indian currency (INR)
 * @param amount - The number to format
 * @param locale - The locale to use for formatting (defaults to 'en-IN')
 * @param currency - The currency code (defaults to 'INR')
 * @returns Formatted currency string
 */
export const formatCurrency = (
    amount: number,
    locale: string = 'en-IN',
    currency: string = 'INR'
  ): string => {
    // Handle edge cases
    if (amount === null || amount === undefined) {
      return '₹0.00';
    }
  
    try {
      // Using Intl.NumberFormat for standardized currency formatting
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  
      return formatter.format(amount);
    } catch (error) {
      // Fallback formatting if Intl.NumberFormat fails
      return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
  };
  
  // You can also add more formatting utilities in this file
  
  /**
   * Formats a large number with Indian number system (with lakhs and crores)
   * @param amount - The number to format
   * @returns Formatted string
   */
  export const formatIndianNumber = (amount: number): string => {
    const formatter = new Intl.NumberFormat('en-IN');
    return formatter.format(amount);
  };
  
  /**
   * Formats a number as compact currency (e.g., 10K, 1M, etc.)
   * @param amount - The number to format
   * @returns Formatted string
   */
  export const formatCompactCurrency = (amount: number): string => {
    const formatter = new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      compactDisplay: 'short',
      style: 'currency',
      currency: 'INR',
    });
    return formatter.format(amount);
  };
  
  // Usage examples:
  /*
  formatCurrency(1234567.89)     // "₹12,34,567.89"
  formatCurrency(1000)           // "₹1,000.00"
  formatIndianNumber(1234567)    // "12,34,567"
  formatCompactCurrency(1000000) // "₹10L" or "₹1M" depending on the browser
  */