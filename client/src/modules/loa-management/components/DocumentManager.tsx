// src/modules/loa-management/components/DocumentManager.tsx
import { useState } from 'react';
import { Upload, Button, List, Space, Tooltip, Modal } from 'antd';
import { 
  UploadOutlined, 
  DownloadOutlined, 
  DeleteOutlined,
  EyeOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { useDocuments } from '../hooks/useDocuments';
import { LOADocument, DocumentUploadInput, LOADocumentType, DocumentAccessLevel } from '@emprise/shared/src/types/loa';

interface DocumentManagerProps {
  loaId: string;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ loaId }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const {
    documents,
    loading,
    uploading,
    downloading,
    handleUpload,
    handleDownload,
    handleDelete,
  } = useDocuments({ loaId });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FilePdfOutlined className="text-red-500" />;
    if (fileType.includes('image')) return <FileImageOutlined className="text-blue-500" />;
    return <FileOutlined className="text-gray-500" />;
  };

  const onFileSelect = async (file: File) => {
    const metadata: Omit<DocumentUploadInput, 'file'> = {
      title: file.name,
      documentType: LOADocumentType.LOA_LETTER, // Use enum value
      accessLevel: DocumentAccessLevel.INTERNAL, // Use enum value
      requiresApproval: false,
    };

    try {
      await handleUpload(file, metadata);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Upload
          customRequest={({ file }) => onFileSelect(file as File)}
          showUploadList={false}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        >
          <Button 
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Upload Document
          </Button>
        </Upload>
      </div>

      <List
        loading={loading}
        dataSource={documents}
        className="bg-white rounded-lg shadow-sm"
        renderItem={(document) => (
          <List.Item
            className="hover:bg-gray-50 transition-colors"
            actions={[
              <Tooltip title="Preview">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => setPreviewUrl(document.filePath)}
                  className="text-blue-600 hover:text-blue-700"
                />
              </Tooltip>,
              <Tooltip title="Download">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(document.id, document.fileName)}
                  loading={downloading}
                  className="text-green-600 hover:text-green-700"
                />
              </Tooltip>,
              <Tooltip title="Delete">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Delete Document',
                      content: 'Are you sure you want to delete this document?',
                      okText: 'Delete',
                      okButtonProps: { danger: true },
                      onOk: () => handleDelete(document.id),
                    });
                  }}
                  className="text-red-600 hover:text-red-700"
                />
              </Tooltip>
            ]}
          >
            <List.Item.Meta
              avatar={getFileIcon(document.fileType)}
              title={
                <span className="font-medium text-gray-800">
                  {document.title}
                </span>
              }
              description={
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Type: {document.documentType}</div>
                  <div>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</div>
                  <div>Size: {formatFileSize(document.fileSize)}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title="Document Preview"
        open={!!previewUrl}
        onCancel={() => setPreviewUrl(null)}
        footer={null}
        width="80%"
        className="top-8"
      >
        {previewUrl && (
          <div className="h-[80vh]">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Document Preview"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};