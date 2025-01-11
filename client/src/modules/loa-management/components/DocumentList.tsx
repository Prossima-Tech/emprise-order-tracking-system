// src/modules/loa-management/components/DocumentList.tsx
import { Table, Button, Space, Tooltip, Tag } from 'antd';
import { 
  DownloadOutlined, 
  EyeOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { LOADocument, LOADocumentType } from '@emprise/shared/src/types/loa';
import { formatFileSize } from '../../../utils/format';
import styles from './DocumentList.module.css';

interface DocumentListProps {
  documents: LOADocument[];
  loading: boolean;
  onDownload: (document: LOADocument) => void;
  onView: (document: LOADocument) => void;
  onDelete: (document: LOADocument) => void;
}

export const DocumentList = ({
  documents,
  loading,
  onDownload,
  onView,
  onDelete,
}: DocumentListProps) => {
  const columns = [
    {
      title: 'Document Type',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (type: LOADocumentType) => (
        <Tag color={getDocumentTypeColor(type)}>
          {type.replace(/_/g, ' ')}
        </Tag>
      ),
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LOADocument) => (
        <Space>
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              type="text"
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => onDownload(record)}
              type="text"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
              type="text"
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getDocumentTypeColor = (type: LOADocumentType) => {
    const colors: Record<LOADocumentType, string> = {
      [LOADocumentType.LOA_LETTER]: 'blue',
      [LOADocumentType.AMENDMENT]: 'purple',
      [LOADocumentType.SCOPE_DOCUMENT]: 'green',
      [LOADocumentType.TECHNICAL_SPECIFICATION]: 'cyan',
      [LOADocumentType.COMMERCIAL_TERMS]: 'orange',
      [LOADocumentType.OTHER]: 'default',
    };
    return colors[type];
  };

  return (
    <Table
      columns={columns}
      dataSource={documents}
      loading={loading}
      rowKey="id"
      pagination={false}
      className={styles.table}
    />
  );
};