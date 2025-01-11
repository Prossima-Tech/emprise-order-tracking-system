import api from '../../../config/axios';
import { PODocument } from '../../../types/purchase-order';

export const poDocumentApi = {
  getDocuments: (poId: string) =>
    api.get<PODocument[]>(`/purchase-orders/${poId}/documents`),

  uploadDocument: (poId: string, formData: FormData) =>
    api.post<PODocument>(`/purchase-orders/${poId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteDocument: (poId: string, documentId: string) =>
    api.delete(`/purchase-orders/${poId}/documents/${documentId}`),

  downloadDocument: (poId: string, documentId: string) =>
    api.get(`/purchase-orders/${poId}/documents/${documentId}/download`, {
      responseType: 'blob',
    }),
};
