// FDR Data Extraction Utility
import Tesseract from 'tesseract.js';
import apiClient from '../../../lib/utils/api-client';

interface ExtractedFDRData {
  amount: number | null;
  maturityDate: string | null;
  submissionDate: string | null;
  bankName: string;
}

export async function extractFDRData(imageFile: File): Promise<ExtractedFDRData> {
  try {
    // OCR with Tesseract
    const result = await Tesseract.recognize(
      imageFile,
      'eng',
      { logger: m => console.log(m) }
    );

    const text = result.data.text;
    console.log('Raw extracted text:', text);

    // Call backend API for AI extraction
    const apiResponse = await apiClient.post('/emds/extract', {
      extractedText: text
    });

    if (apiResponse.data.status !== 'success') {
      throw new Error(apiResponse.data.message || 'AI extraction failed');
    }

    const extractedData = apiResponse.data.data;
    console.log('AI Extracted data:', extractedData);

    // Build final result with validation
    const finalData: ExtractedFDRData = {
      amount: validateNumber(extractedData.amount),
      maturityDate: validateDate(extractedData.maturityDate),
      submissionDate: validateDate(extractedData.submissionDate),
      bankName: extractedData.bankName || 'IDBI'
    };

    console.log('Final extracted data:', finalData);
    return finalData;

  } catch (error) {
    console.error('Error in FDR data extraction:', error);
    return {
      amount: null,
      maturityDate: null,
      submissionDate: null,
      bankName: 'IDBI'
    };
  }
}

// Helper functions
function validateDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = dateStr.match(datePattern);
  if (!match) return null;

  const [_, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}`);
  return date.toString() === 'Invalid Date' ? null : dateStr;
}

function validateNumber(num: number | null | undefined): number | null {
  if (typeof num !== 'number' || isNaN(num)) return null;
  return num > 0 ? num : null;
}