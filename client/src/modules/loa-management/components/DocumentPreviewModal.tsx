// import { Modal, Spin, Button, Space, Typography } from 'antd';
// import { 
//   DownloadOutlined, 
//   FullscreenOutlined, 
//   FullscreenExitOutlined 
// } from '@ant-design/icons';
// import { useState } from 'react';
// import { LOADocument } from '@emprise/shared/src/types/loa';
// import { loaApi } from '../services';
// import styles from './DocumentPreviewModal.module.css';
// import React from 'react';

// const { Text } = Typography;

// interface DocumentPreviewModalProps {
//   document: LOADocument | null;
//   onClose: () => void;
// }

// export const DocumentPreviewModal = ({
//   document,
//   onClose,
// }: DocumentPreviewModalProps) => {
//   const [loading, setLoading] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState<string>('');
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   const handleDownload = async () => {
//     if (!document) return;
    
//     try {
//       const url = await loaApi.downloadDocument(document.loaId, document.id);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = document.fileName;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (error) {
//       // Handle error
//     }
//   };

//   const loadPreview = async () => {
//     if (!document) return;

//     try {
//       setLoading(true);
//       const url = await loaApi.downloadDocument(document.loaId, document.id);
//       setPreviewUrl(url);
//     } catch (error) {
//       // Handle error
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleFullscreen = () => {
//     const previewContainer = document.getElementById('document-preview-container');
//     if (!previewContainer) return;

//     if (!isFullscreen) {
//       if (previewContainer.requestFullscreen) {
//         previewContainer.requestFullscreen();
//       }
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       }
//     }
//     setIsFullscreen(!isFullscreen);
//   };

//   // Load preview when document changes
//   React.useEffect(() => {
//     if (document) {
//       loadPreview();
//     }
//     return () => {
//       // Cleanup preview URL when component unmounts
//       if (previewUrl) {
//         URL.revokeObjectURL(previewUrl);
//       }
//     };
//   }, [document]);

//   if (!document) return null;

//   const getFileExtension = (fileName: string) => {
//     return fileName.split('.').pop()?.toLowerCase() || '';
//   };

//   const renderPreview = () => {
//     if (loading) {
//       return (
//         <div className={styles.loadingContainer}>
//           <Spin size="large" />
//         </div>
//       );
//     }

//     const extension = getFileExtension(document.fileName);

//     // Image preview
//     if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
//       return (
//         <img 
//           src={previewUrl} 
//           alt={document.fileName} 
//           className={styles.imagePreview}
//         />
//       );
//     }

//     // PDF preview
//     if (extension === 'pdf') {
//       return (
//         <iframe
//           src={`${previewUrl}#toolbar=0`}
//           className={styles.pdfPreview}
//           title="PDF Preview"
//         />
//       );
//     }

//     // Office documents preview (using Microsoft Office Online Viewer)
//     if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
//       const encodedUrl = encodeURIComponent(previewUrl);
//       return (
//         <iframe
//           src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`}
//           className={styles.officePreview}
//           title="Office Document Preview"
//         />
//       );
//     }

//     // Fallback for unsupported file types
//     return (
//       <div className={styles.unsupportedFormat}>
//         <Text>Preview not available for this file type</Text>
//         <Button 
//           type="primary" 
//           icon={<DownloadOutlined />}
//           onClick={handleDownload}
//         >
//           Download to View
//         </Button>
//       </div>
//     );
//   };

//   return (
//     <Modal
//       title={
//         <div className={styles.modalHeader}>
//           <Text strong>{document.fileName}</Text>
//           <Space>
//             <Button
//               icon={<DownloadOutlined />}
//               onClick={handleDownload}
//             >
//               Download
//             </Button>
//             <Button
//               icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
//               onClick={toggleFullscreen}
//             >
//               {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
//             </Button>
//           </Space>
//         </div>
//       }
//       open={!!document}
//       onCancel={onClose}
//       footer={null}
//       width="80%"
//       centered
//       className={styles.previewModal}
//     >
//       <div 
//         id="document-preview-container" 
//         className={`${styles.previewContainer} ${isFullscreen ? styles.fullscreen : ''}`}
//       >
//         {renderPreview()}
//       </div>
//     </Modal>
//   );
// };
