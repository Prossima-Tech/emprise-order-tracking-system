// src/modules/loa-management/components/DocumentUploadModal.tsx
import { Modal, Form, Input, Select, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { LOADocumentType } from '../src/types/loa';
import { loaApi } from '../services';
import styles from './DocumentUploadModal.module.css';

const { Dragger } = Upload;

interface DocumentUploadModalProps {
  loaId: string;
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const DocumentUploadModal = ({
  loaId,
  open,
  onCancel,
  onSuccess,
}: DocumentUploadModalProps) => {
  const [form] = Form.useForm();

  const uploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.pdf,.doc,.docx,.xlsx,.xls',
    beforeUpload: (file: File) => {
      const isValidSize = file.size / 1024 / 1024 < 10; // 10MB limit
      if (!isValidSize) {
        message.error('File must be smaller than 10MB!');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess, onError }: any) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', form.getFieldValue('documentType'));
        formData.append('description', form.getFieldValue('description'));

        await loaApi.uploadDocument(loaId, formData);
        onSuccess();
      } catch (error) {
        onError(error);
      }
    },
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      onSuccess();
      form.resetFields();
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Modal
      title="Upload Document"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.form}
      >
        <Form.Item
          name="documentType"
          label="Document Type"
          rules={[{ required: true, message: 'Please select document type' }]}
        >
          <Select>
            {Object.values(LOADocumentType).map(type => (
              <Select.Option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="file"
          label="Document"
          rules={[{ required: true, message: 'Please upload a document' }]}
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for PDF, DOC, DOCX, XLS, XLSX files. Max size: 10MB
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};