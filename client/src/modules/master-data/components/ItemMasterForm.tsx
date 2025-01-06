// src/modules/master-data/components/ItemMasterForm.tsx
import React from 'react';
import { Form, Input, Switch } from 'antd';
import { ItemMaster } from '@emprise/shared/src/types/master';

interface ItemMasterFormProps {
  form: any;
  initialValues: Partial<ItemMaster>;
}

export const ItemMasterForm: React.FC<ItemMasterFormProps> = ({
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
        name="itemCode"
        label="Item Code"
        rules={[{ required: true, message: 'Please enter item code' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please enter description' }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item
        name="category"
        label="Category"
        rules={[{ required: true, message: 'Please enter category' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="unit"
        label="Unit"
        rules={[{ required: true, message: 'Please enter unit' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="Status"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};