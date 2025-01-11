// src/modules/loa-management/hooks/useDocuments.ts
import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { loaApi } from '../services/api';
import type { LOADocument, DocumentUploadInput } from '../../../types/loa';

interface DocumentOperations {
  documents: LOADocument[];
  loading: boolean;
  uploading: boolean;
  downloading: boolean;
  error: string | null;
  handleUpload: (file: File, metadata: Omit<DocumentUploadInput, 'file'>) => Promise<void>;
  handleDownload: (documentId: string, filename: string) => Promise<void>;
  handleDelete: (documentId: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
}

interface UseDocumentsProps {
  loaId: string;
  autoLoad?: boolean;
}

export const useDocuments = ({ loaId, autoLoad = true }: UseDocumentsProps): DocumentOperations => {
  const [documents, setDocuments] = useState<LOADocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDocuments = await loaApi.getDocuments(loaId);
      setDocuments(fetchedDocuments);
    } catch (error: any) {
      setError(error.message);
      message.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [loaId]);

  const handleUpload = useCallback(async (
    file: File, 
    metadata: Omit<DocumentUploadInput, 'file'>
  ) => {
    try {
      setUploading(true);
      setError(null);

      // Validate file size (e.g., 10MB limit)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      await loaApi.uploadDocument(loaId, formData);
      message.success('Document uploaded successfully');
      await refreshDocuments();
    } catch (error: any) {
      setError(error.message);
      message.error(error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, [loaId, refreshDocuments]);

  const handleDownload = useCallback(async (documentId: string, filename: string) => {
    try {
      setDownloading(true);
      setError(null);
      
      const url = await loaApi.downloadDocument(loaId, documentId);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Document downloaded successfully');
    } catch (error: any) {
      setError(error.message);
      message.error('Failed to download document');
      throw error;
    } finally {
      setDownloading(false);
    }
  }, [loaId]);

  const handleDelete = useCallback(async (documentId: string) => {
    try {
      setError(null);
      await loaApi.deleteDocument(loaId, documentId);
      message.success('Document deleted successfully');
      await refreshDocuments();
    } catch (error: any) {
      setError(error.message);
      message.error('Failed to delete document');
      throw error;
    }
  }, [loaId, refreshDocuments]);

  // Load documents on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      refreshDocuments();
    }
  }, [autoLoad, refreshDocuments]);

  return {
    documents,
    loading,
    uploading,
    downloading,
    error,
    handleUpload,
    handleDownload,
    handleDelete,
    refreshDocuments,
  };
};
