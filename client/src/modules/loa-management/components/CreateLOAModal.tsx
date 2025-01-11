// src/modules/loa-management/components/CreateLOAModal.tsx
import { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  Select, 
  Upload, 
  message, 
  Divider 
} from 'antd';
import { 
  InboxOutlined, 
  FileOutlined, 
  FilePdfOutlined, 
  FileWordOutlined, 
  FileImageOutlined 
} from '@ant-design/icons';
import { 
  LOARecordInput, 
  LOADocumentType, 
  DocumentAccessLevel 
} from '@emprise/shared/src/types/loa';
import { loaApi } from '../services/api';
import type { UploadFile } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';

const { Dragger } = Upload;

interface CreateLOAModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// Dummy data for offers
const DUMMY_OFFERS = [
  { 
    id: 'OFF001', 
    tenderNo: 'TNR2023001', 
    title: 'Power Plant Maintenance', 
    amount: 1500000 
  },
  { 
    id: 'OFF002', 
    tenderNo: 'TNR2023002', 
    title: 'Solar Panel Installation', 
    amount: 2500000 
  },
  { 
    id: 'OFF003', 
    tenderNo: 'TNR2023003', 
    title: 'Grid Modernization', 
    amount: 3500000 
  },
];

// Dummy data for departments
const DUMMY_DEPARTMENTS = [
  { code: 'ENG', name: 'Engineering', head: 'John Smith' },
  { code: 'OPS', name: 'Operations', head: 'Sarah Johnson' },
  { code: 'PRJ', name: 'Projects', head: 'Mike Brown' },
  { code: 'QA', name: 'Quality Assurance', head: 'Lisa Davis' },
];

// Dummy data for issuing authorities
const DUMMY_AUTHORITIES = [
  'Power Generation Corporation',
  'Renewable Energy Board',
  'State Electricity Board',
  'Central Power Authority',
];

export const CreateLOAModal: React.FC<CreateLOAModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<typeof DUMMY_OFFERS[0] | null>(null);

  const handleOfferChange = (offerId: string) => {
    const offer = DUMMY_OFFERS.find(o => o.id === offerId);
    setSelectedOffer(offer || null);
    if (offer) {
      form.setFieldsValue({ value: offer.amount });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Convert form values to API format
      const loaData: LOARecordInput = {
        ...values,
        receivedDate: dayjs(values.receivedDate).format('YYYY-MM-DD'),
        validityPeriod: dayjs(values.validityPeriod).format('YYYY-MM-DD'),
        value: Number(values.value),
      };

      // First create the LOA
      const loa = await loaApi.recordLOA(loaData);

      // Then upload documents if any
      if (fileList.length > 0) {
        const uploadPromises = fileList.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file.originFileObj as RcFile);
          formData.append('metadata', JSON.stringify({
            title: file.name,
            documentType: LOADocumentType.LOA_LETTER,
            accessLevel: DocumentAccessLevel.INTERNAL,
            requiresApproval: false,
          }));

          return loaApi.uploadDocument(loa.id, formData);
        });

        await Promise.all(uploadPromises);
      }

      message.success('LOA recorded successfully');
      form.resetFields();
      setFileList([]);
      setSelectedOffer(null);
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to record LOA');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FilePdfOutlined className="text-red-500" />;
    if (fileType.includes('word')) return <FileWordOutlined className="text-blue-500" />;
    if (fileType.includes('image')) return <FileImageOutlined className="text-green-500" />;
    return <FileOutlined className="text-gray-500" />;
  };

  const uploadProps = {
    onRemove: (file: UploadFile) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: RcFile) => {
      // Validate file type
      const isValidType = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ].includes(file.type);

      if (!isValidType) {
        message.error('You can only upload PDF, Word, or image files!');
        return false;
      }

      // Validate file size (10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return false;
      }

      setFileList([...fileList, file]);
      return false; // Prevent automatic upload
    },
    fileList,
  };

  return (
    <Modal
      title="Record New LOA"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      className="top-8"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{
          loaNo: `LOA${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          receivedDate: dayjs(),
          validityPeriod: dayjs().add(1, 'year'),
        }}
      >
        <div className="grid grid-cols-2 gap-x-6">
          <Form.Item
            name="loaNo"
            label="LOA Number"
            rules={[{ required: true, message: 'Please enter LOA number' }]}
          >
            <Input placeholder="Enter LOA number" />
          </Form.Item>

          <Form.Item
            name="offerId"
            label="Offer"
            rules={[{ required: true, message: 'Please select offer' }]}
          >
            <Select
              placeholder="Select offer"
              onChange={handleOfferChange}
              options={DUMMY_OFFERS.map(offer => ({
                value: offer.id,
                label: `${offer.tenderNo} - ${offer.title}`,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="value"
            label="Value"
            rules={[{ required: true, message: 'Please enter value' }]}
          >
            <InputNumber<string>
              className="w-full"
              formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/₹\s?|(,*)/g, '') ?? '0'}
              min="0"
              stringMode
            />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select
              placeholder="Select department"
              options={DUMMY_DEPARTMENTS.map(dept => ({
                value: dept.code,
                label: `${dept.name} (${dept.head})`,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="projectCode"
            label="Project Code"
            rules={[{ required: true, message: 'Please enter project code' }]}
          >
            <Input placeholder="Enter project code" />
          </Form.Item>

          <Form.Item
            name="issuingAuthority"
            label="Issuing Authority"
            rules={[{ required: true, message: 'Please enter issuing authority' }]}
          >
            <Select
              placeholder="Select issuing authority"
              options={DUMMY_AUTHORITIES.map(auth => ({
                value: auth,
                label: auth,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="receivedDate"
            label="Received Date"
            rules={[{ required: true, message: 'Please select received date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="validityPeriod"
            label="Validity Period"
            rules={[
              { required: true, message: 'Please select validity period' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('receivedDate')) {
                    return Promise.resolve();
                  }
                  if (dayjs(value).isBefore(dayjs(getFieldValue('receivedDate')))) {
                    return Promise.reject(new Error('Validity period must be after received date'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </div>

        <Form.Item
          name="scope"
          label="Scope"
          rules={[{ required: true, message: 'Please enter scope' }]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Enter the scope of work..."
          />
        </Form.Item>

        <Form.Item
          name="remarks"
          label="Remarks"
        >
          <Input.TextArea 
            rows={3}
            placeholder="Any additional remarks..."
          />
        </Form.Item>

        <Divider />

        <div className="mb-4">
          <h4 className="font-medium mb-2">Upload Documents</h4>
          <p className="text-gray-500 text-sm mb-4">
            Please upload the LOA document and any other relevant files
          </p>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for PDF, Word, and image files. Maximum file size: 10MB
            </p>
          </Dragger>
        </div>

        {fileList.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Selected Files:</h4>
            <ul className="space-y-2">
              {fileList.map((file, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  {getFileIcon(file.type || '')}
                  <span className="ml-2">{file.name}</span>
                  <span className="ml-2 text-gray-400">
                    ({(file.size! / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Form>
    </Modal>
  );
};