// FDR Data Extraction Utility
import apiClient from '../../../lib/utils/api-client';

interface ExtractedFDRData {
  amount: number | null;
  maturityDate: string | null;
  submissionDate: string | null;
  bankName: string;
}

export async function extractFDRData(file: File): Promise<ExtractedFDRData> {
  try {
    // Create FormData to send file to backend
    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending file to backend for extraction...', file.name, file.type);

    // Call backend API for complete OCR + AI extraction
    const apiResponse = await apiClient.post('/emds/extract-from-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (apiResponse.data.status !== 'success') {
      throw new Error(apiResponse.data.message || 'Extraction failed');
    }

    const extractedData = apiResponse.data.data;
    console.log('Backend extracted data:', extractedData);

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