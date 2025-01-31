
// infrastructure/services/OCRService.ts
import Tesseract from 'tesseract.js';

export class OCRService {
  
  async extractDataFromImage(imagePath: string): Promise<any> {
    try {
      const result = await Tesseract.recognize(
        imagePath,
        'eng',
        { logger: m => console.log(m) }
      );

      // Extract relevant data using regex patterns
      const amount = this.extractAmount(result.data.text);
      const dates = this.extractDates(result.data.text);
      const bankDetails = this.extractBankDetails(result.data.text);

      return {
        amount,
        submissionDate: dates.submissionDate,
        maturityDate: dates.maturityDate,
        bankName: bankDetails.bankName,
        extractedText: result.data.text
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract data from document');
    }
  }

  private extractAmount(text: string): number | null {
    const amountRegex = /(?:Rs\.|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i;
    const match = text.match(amountRegex);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  }

  private extractDates(text: string): { submissionDate: Date | null; maturityDate: Date | null } {
    const dateRegex = /(\d{2}[-/]\d{2}[-/]\d{4})/g;
    const dates = text.match(dateRegex);
    
    return {
      submissionDate: dates?.[0] ? new Date(dates[0]) : null,
      maturityDate: dates?.[1] ? new Date(dates[1]) : null
    };
  }

  private extractBankDetails(text: string): { bankName: string | null } {
    const bankRegex = /(?:IDBI|STATE BANK|SBI|HDFC|ICICI)\s*BANK/i;
    const match = text.match(bankRegex);
    return {
      bankName: match ? match[0] : 'IDBI BANK'
    };
  }
}