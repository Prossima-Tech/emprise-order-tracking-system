// src/modules/master-data/components/VendorMasterForm.tsx
import React from 'react';
import { Form, Input, Select, Switch } from 'antd';
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
    >
      <Form.Item
        name="name"
        label="Vendor Name"
        rules={[{ required: true, message: 'Please enter vendor name' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone"
        rules={[{ required: true, message: 'Please enter phone number' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="address"
        label="Address"
        rules={[{ required: true, message: 'Please enter address' }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="city"
          label="City"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="state"
          label="State"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="pinCode"
          label="PIN Code"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="gstin"
          label="GSTIN"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="pan"
          label="PAN"
        >
          <Input />
        </Form.Item>
      </div>

      <Form.Item
        name="category"
        label="Category"
        rules={[{ required: true }]}
      >
        <Select
          mode="multiple"
          options={VENDOR_CATEGORIES}
          placeholder="Select categories"
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true }]}
      >
        <Select
          options={VENDOR_STATUSES}
          placeholder="Select status"
        />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="Active"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};