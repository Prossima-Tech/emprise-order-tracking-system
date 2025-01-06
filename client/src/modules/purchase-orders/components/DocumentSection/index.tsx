// src/modules/purchase-orders/components/DocumentSection/index.tsx
import { Card, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { DocumentList } from './DocumentList';
import { DocumentUploadModal } from './DocumentUploadModal';
import { useQuery } from '../../../../hooks/useQuery';
import { poDocumentApi } from '../../services/document';
import styles from './DocumentSection.module.css';

interface DocumentSectionProps {
  poId: string;
}

export const DocumentSection = ({ poId }: DocumentSectionProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: documents, loading, refetch } = useQuery({
    queryFn: () => poDocumentApi.getDocuments(poId),
  });

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    refetch();
    message.success('Document uploaded successfully');
  };

  return (
    <Card 
      title="Documents" 
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsUploadModalOpen(true)}
        >
          Upload Document
        </Button>
      }
      className={styles.section}
    >
      <DocumentList
        documents={documents || []}
        loading={loading}
        onRefresh={refetch}
      />

      <DocumentUploadModal
        poId={poId}
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </Card>
  );
};