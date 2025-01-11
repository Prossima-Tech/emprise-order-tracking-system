// src/modules/master-data/components/VendorMasterForm.tsx
import React from 'react';
import { Form, Input, Select, Switch, Space, Divider, Typography } from 'antd';
import { 
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  BankOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Vendor } from '@emprise/shared/src/types/master';
import { VENDOR_CATEGORIES, VENDOR_STATUSES } from '../constants';

interface VendorMasterFormProps {
  form: any;
  initialValues?: Partial<Vendor>;
}

export const VendorMasterForm: React.FC<VendorMasterFormProps> = ({
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
          name="name"
          label={
            <Space>
              <UserOutlined />
              Vendor Name
            </Space>
          }
          rules={[{ required: true, message: 'Please enter vendor name' }]}
          tooltip="Official registered name of the vendor"
        >
          <Input placeholder="Enter vendor name" />
        </Form.Item>

        <Form.Item
          name="email"
          label={
            <Space>
              <MailOutlined />
              Email
            </Space>
          }
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
          tooltip="Primary contact email address"
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          name="phone"
          label={
            <Space>
              <PhoneOutlined />
              Phone
            </Space>
          }
          rules={[
            { required: true, message: 'Please enter phone number' },
            { pattern: /^[0-9-+()]*$/, message: 'Please enter a valid phone number' }
          ]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>
      </div>

      <Divider orientation="left">Address Information</Divider>

      <div className="mb-6">
        <Form.Item
          name="address"
          label={
            <Space>
              <HomeOutlined />
              Address
            </Space>
          }
          rules={[{ required: true, message: 'Please enter address' }]}
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Enter complete address"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="city"
            label={
              <Space>
                <GlobalOutlined />
                City
              </Space>
            }
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter city" />
          </Form.Item>

          <Form.Item
            name="state"
            label={
              <Space>
                <GlobalOutlined />
                State
              </Space>
            }
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter state" />
          </Form.Item>

          <Form.Item
            name="country"
            label={
              <Space>
                <GlobalOutlined />
                Country
              </Space>
            }
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter country" />
          </Form.Item>

          <Form.Item
            name="pinCode"
            label={
              <Space>
                <GlobalOutlined />
                PIN Code
              </Space>
            }
            rules={[
              { required: true },
              { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit PIN code' }
            ]}
          >
            <Input placeholder="Enter PIN code" />
          </Form.Item>
        </div>
      </div>

      <Divider orientation="left">Tax Information</Divider>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Form.Item
          name="gstin"
          label={
            <Space>
              <BankOutlined />
              GSTIN
            </Space>
          }
          tooltip="15-digit Goods and Services Tax Identification Number"
        >
          <Input placeholder="Enter GSTIN" className="font-mono" />
        </Form.Item>

        <Form.Item
          name="pan"
          label={
            <Space>
              <BankOutlined />
              PAN
            </Space>
          }
          tooltip="10-digit Permanent Account Number"
        >
          <Input placeholder="Enter PAN" className="font-mono uppercase" />
        </Form.Item>
      </div>

      <Divider orientation="left">Classification</Divider>

      <Form.Item
        name="category"
        label={
          <Space>
            <TeamOutlined />
            Category
          </Space>
        }
        rules={[{ required: true }]}
        tooltip="Business categories this vendor operates in"
      >
        <Select
          mode="multiple"
          options={VENDOR_CATEGORIES}
          placeholder="Select categories"
          showSearch
          allowClear
        />
      </Form.Item>

      <Form.Item
        name="status"
        label={
          <Space>
            <InfoCircleOutlined />
            Status
          </Space>
        }
        rules={[{ required: true }]}
      >
        <Select
          options={VENDOR_STATUSES}
          placeholder="Select status"
          showSearch
        />
      </Form.Item>

      {/* Continuing from where we left off */}
      <Form.Item
          name="isActive"
          label={
            <Space>
              <InfoCircleOutlined />
              Active Status
            </Space>
          }
          valuePropName="checked"
          tooltip="Inactive vendors won't appear in selection lists"
          extra="Toggle to enable or disable this vendor in the system"
        >
          <Switch 
            checkedChildren="Active" 
            unCheckedChildren="Inactive"
            className="bg-gray-300"
          />
        </Form.Item>

        {/* Optional Notes Section */}
        <Form.Item
          name="notes"
          label={
            <Space>
              <InfoCircleOutlined />
              Additional Notes
            </Space>
          }
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Enter any additional notes or remarks about this vendor..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        {/* Form Footer - Helper Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Typography.Text type="secondary" className="text-sm">
            <InfoCircleOutlined className="mr-2" />
            All fields marked with an asterisk (*) are required. Please ensure all information
            is accurate and up-to-date.
          </Typography.Text>
        </div>
      </Form>
  );
};

export default VendorMasterForm;