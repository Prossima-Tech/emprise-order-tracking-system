// src/modules/master-data/components/ItemMasterForm.tsx
import React from 'react';
import { Form, Input, Switch, Select, Space, Divider } from 'antd';
import { ItemMaster } from '../../../types/master';
import { 
  FileTextOutlined, 
  DatabaseOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';

interface ItemMasterFormProps {
  form: any;
  initialValues: Partial<ItemMaster>;
}

// Common units for reference
const commonUnits = [
  'PCS', 'KG', 'M', 'CM', 'L', 'ML', 'SET'
].map(unit => ({ label: unit, value: unit }));

export const ItemMasterForm: React.FC<ItemMasterFormProps> = ({
  form,
  initialValues,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      className="p-4"
    >
      {/* Basic Information */}
      <div className="mb-6">
        <Form.Item
          name="itemCode"
          label={
            <Space>
              <FileTextOutlined />
              Item Code
            </Space>
          }
          rules={[
            { required: true, message: 'Please enter item code' },
            { pattern: /^[A-Z0-9-]+$/, message: 'Item code should contain only uppercase letters, numbers, and hyphens' }
          ]}
          tooltip="Item code must be unique and should follow the format: ABC-123"
        >
          <Input 
            placeholder="Enter item code" 
            className="font-mono"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <Space>
              <FileTextOutlined />
              Description
            </Space>
          }
          rules={[
            { required: true, message: 'Please enter description' },
            { min: 10, message: 'Description must be at least 10 characters' }
          ]}
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Enter detailed item description"
            showCount
            maxLength={500}
          />
        </Form.Item>
      </div>

      <Divider />

      {/* Classification */}
      <div className="mb-6">
        <Form.Item
          name="category"
          label={
            <Space>
              <DatabaseOutlined />
              Category
            </Space>
          }
          rules={[{ required: true, message: 'Please enter category' }]}
          tooltip="Group similar items under the same category"
        >
          <Select
            showSearch
            placeholder="Select or enter category"
            allowClear
          >
            {/* Add your category options here */}
          </Select>
        </Form.Item>

        <Form.Item
          name="unit"
          label={
            <Space>
              <DatabaseOutlined />
              Unit of Measurement
            </Space>
          }
          rules={[{ required: true, message: 'Please enter unit' }]}
          tooltip="Standard unit of measurement for this item"
        >
          <Select
            showSearch
            placeholder="Select or enter unit"
            allowClear
            options={commonUnits}
          />
        </Form.Item>
      </div>

      <Divider />

      {/* Status */}
      <Form.Item
        name="isActive"
        label={
          <Space>
            <InfoCircleOutlined />
            Status
          </Space>
        }
        valuePropName="checked"
        extra="Inactive items will not appear in selection lists"
      >
        <Switch 
          checkedChildren="Active" 
          unCheckedChildren="Inactive"
        />
      </Form.Item>
    </Form>
  );
};

export default ItemMasterForm;