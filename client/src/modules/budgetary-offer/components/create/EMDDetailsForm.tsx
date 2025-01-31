// src/components/create/EMDDetailsForm.tsx

import React from 'react';
import { Form, InputNumber, DatePicker, Upload, Button, Typography, message, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title } = Typography;

interface EMDDetailsFormProps {
  form: any;
  fileList: UploadFile[];
  onFileChange: (info: any) => void;
}

export const EMDDetailsForm: React.FC<EMDDetailsFormProps> = ({ 
  form, 
  fileList, 
  onFileChange 
}) => {
  const uploadProps = {
    beforeUpload: (file: File) => {
      const isAllowed = file.type === 'application/pdf' || 
                       file.type === 'image/jpeg' || 
                       file.type === 'image/png';
      if (!isAllowed) {
        message.error('You can only upload PDF/JPG/PNG files!');
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('File must be smaller than 5MB!');
      }
      return false; // Prevent automatic upload
    },
    fileList,
    onChange: onFileChange,
    maxCount: 1
  };

  return (
    <>
      <Title level={4}>EMD Details</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name={['emdDetails', 'amount']}
          label="EMD Amount"
          rules={[{ required: true, message: 'Please enter EMD amount' }]}
        >
          <InputNumber
            className="w-full"
            min={0.01}
            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined) => {
                const parsed = value?.replace(/₹\s?|(,*)/g, '');
                return parsed ? Number(parsed) : 0;
              }}
          />
        </Form.Item>

        <Form.Item
          name={['emdDetails', 'submissionDate']}
          label="Submission Date"
          rules={[{ required: true, message: 'Please select submission date' }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item label="Bank Name">
          <Input value="IDBI" disabled />
        </Form.Item>

        <Form.Item label="Payment Mode">
          <Input value="FDR" disabled />
        </Form.Item>

        <Form.Item
          label="EMD Document"
          required
          className="col-span-2"
          rules={[
            {
              validator: async (_) => {
                if (!fileList.length) {
                  return Promise.reject(new Error('Please upload EMD document'));
                }
              },
            },
          ]}
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload Document</Button>
          </Upload>
          <div className="mt-2 text-gray-500 text-sm">
            Supported formats: PDF, JPG, PNG (Max: 5MB)
          </div>
        </Form.Item>
      </div>
    </>
  );
};

export default EMDDetailsForm;