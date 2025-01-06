// // src/modules/loa-management/components/LOADocumentsSection.tsx
// import { Card, Button, message } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import { useState } from 'react';
// import { DocumentList } from './DocumentList';
// import { DocumentUploadModal } from './DocumentUploadModal';
// import { DocumentPreviewModal } from './DocumentPreviewModal';
// import { useQuery } from '../../../hooks/useQuery';
// import { loaApi } from '../services';
// import { LOADocument } from '@emprise/shared/src/types/loa';
// import styles from './LOADocumentsSection.module.css';

// interface LOADocumentsSectionProps {
//   loaId: string;
// }

// export const LOADocumentsSection = ({ loaId }: LOADocumentsSectionProps) => {
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [previewDocument, setPreviewDocument] = useState<LOADocument | null>(null);

//   const { data: documents, loading, refetch } = useQuery<LOADocument[]>({
//     queryFn: () => loaApi.getDocuments(loaId),
//   });

//   const handleDownload = async (document: LOADocument) => {
//     try {
//       const url = await loaApi.downloadDocument(loaId, document.id);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = document.fileName;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (error) {
//       message.error('Failed to download document');
//     }
//   };

//   const handleDelete = async (document: LOADocument) => {
//     try {
//       await loaApi.deleteDocument(loaId, document.id);
//       message.success('Document deleted successfully');
//       refetch();
//     } catch (error) {
//       message.error('Failed to delete document');
//     }
//   };

//   return (
//     <Card
//       title="Documents"
//       extra={
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={() => setIsUploadModalOpen(true)}
//         >
//           Upload Document
//         </Button>
//       }
//       className={styles.card}
//     >
//       <DocumentList
//         documents={documents || []}
//         loading={loading}
//         onDownload={handleDownload}
//         onView={(doc) => setPreviewDocument(doc)}
//         onDelete={handleDelete}
//       />

//       <DocumentUploadModal
//         loaId={loaId}
//         open={isUploadModalOpen}
//         onCancel={() => setIsUploadModalOpen(false)}
//         onSuccess={() => {
//           setIsUploadModalOpen(false);
//           refetch();
//         }}
//       />

//       <DocumentPreviewModal
//         document={previewDocument}
//         onClose={() => setPreviewDocument(null)}
//       />
//     </Card>
//   );
// };