
// infrastructure/services/OCRService.ts
import * as fs from 'fs';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';
import { TextractService } from './TextractService';

export class OCRService {
  private textractService: TextractService;

  constructor() {
    this.textractService = new TextractService();
  }

  /**
   * Check if file is PDF by reading magic bytes
   * PDFs start with "%PDF-" signature
   */
  private isPDF(filePath: string): boolean {
    try {
      // First check extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.pdf') return true;

      // If no extension, check magic bytes
      const buffer = fs.readFileSync(filePath);
      const header = buffer.slice(0, 5).toString('utf-8');
      return header === '%PDF-';
    } catch (error) {
      console.error('Error checking if file is PDF:', error);
      return false;
    }
  }

  /**
   * Extract text from PDF using pdf-parse v2 API
   */
  private async extractTextFromPDF(pdfPath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(pdfPath);

      // Use PDFParse class from v2 API
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();

      console.log('Extracted text from PDF:', result.text.substring(0, 200));
      return result.text;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Extract text from file (PDF or image)
   * For PDFs: Use pdf-parse to extract embedded text, fallback to AWS Textract if empty
   * For images: Use AWS Textract for OCR
   */
  async extractTextFromFile(filePath: string): Promise<string> {
    try {
      if (this.isPDF(filePath)) {
        console.log('Extracting text from PDF...');
        const pdfText = await this.extractTextFromPDF(filePath);

        // Check if PDF text extraction returned meaningful content
        const cleanText = pdfText.trim().replace(/\s+/g, ' ');
        const textLength = cleanText.length;

        console.log(`PDF text length: ${textLength} characters`);

        // If PDF text is empty or too short, it's likely a scanned/image-based PDF
        // Use AWS Textract for better OCR
        if (textLength < 50) {
          console.log('PDF appears to be image-based (no embedded text). Using AWS Textract for OCR...');

          try {
            // Use AWS Textract for scanned PDF
            const textractText = await this.textractService.extractText(filePath);

            if (textractText.trim().length > 0) {
              console.log('Textract extraction successful for scanned PDF');
              return textractText;
            }

            throw new Error('No text could be extracted from the scanned PDF');
          } catch (textractError) {
            console.error('Textract OCR on scanned PDF failed:', textractError);
            throw new Error(
              'Failed to extract text from scanned PDF using AWS Textract. ' +
              'Please ensure the document is clear and readable.'
            );
          }
        }

        return pdfText;
      } else {
        console.log('Extracting text from image using AWS Textract...');
        // Use Textract for images as well for consistent, high-quality OCR
        return await this.textractService.extractText(filePath);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      if (error instanceof Error && error.message.includes('scanned document')) {
        throw error; // Propagate the helpful error message
      }
      throw new Error('Failed to extract text from document');
    }
  }

  /**
   * Legacy method - Extract data from image (now supports PDFs too)
   */
  async extractDataFromImage(imagePath: string): Promise<any> {
    try {
      const extractedText = await this.extractTextFromFile(imagePath);

      // Extract relevant data using regex patterns
      const amount = this.extractAmount(extractedText);
      const dates = this.extractDates(extractedText);
      const bankDetails = this.extractBankDetails(extractedText);

      return {
        amount,
        submissionDate: dates.submissionDate,
        maturityDate: dates.maturityDate,
        bankName: bankDetails.bankName,
        extractedText
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