import apiClient from '../../../lib/utils/api-client';

interface FDRExtractionResult {
  depositAmount: number | null;
  maturityValue: number | null;
  bankName: string | null;
  maturityDate: string | null;
  dateOfDeposit: string | null;
  accountNo: string | null;
  fdrNumber: string | null;
  accountName: string | null;
}

export async function extractFDRData(file: File): Promise<FDRExtractionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<{ status: string; data: FDRExtractionResult }>('/fdrs/extract-from-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}
