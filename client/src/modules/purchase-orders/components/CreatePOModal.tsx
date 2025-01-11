// src/modules/purchase-orders/components/CreatePOModal.tsx
import { Modal, Form, Select, DatePicker, InputNumber, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { POCreateInput } from '@emprise/shared/src/types/purchase-order';
import { purchaseOrderApi } from '../services/api';

interface CreatePOModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreatePOModal = ({
  open,
  onCancel,
  onSuccess,
}: CreatePOModalProps) => {
  const [form] = Form.useForm<POCreateInput>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await purchaseOrderApi.createPO({
        ...values,
        deliveryDate: values.deliveryDate.toString(),
      });
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Error creating PO:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Purchase Order"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          name="vendorId"
          label="Vendor"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select vendor">
            <Select.Option value="1">Vendor 1</Select.Option>
            <Select.Option value="2">Vendor 2</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="deliveryDate"
          label="Delivery Date"
          rules={[{ required: true }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Space key={field.key} className="flex items-start mb-4">
                  <Form.Item
                    {...field}
                    name={[field.name, 'itemId']}
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Select item" className="w-60">
                      <Select.Option value="1">Item 1</Select.Option>
                      <Select.Option value="2">Item 2</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'quantity']}
                    rules={[{ required: true }]}
                  >
                    <InputNumber 
                      placeholder="Qty"
                      min={1}
                      className="w-24"
                    />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'unitPrice']}
                    rules={[{ required: true }]}
                  >
                    <InputNumber 
                      placeholder="Price"
                      className="w-32"
                      formatter={value => `₹ ${value}`}
                    />
                  </Form.Item>

                  <MinusCircleOutlined 
                    onClick={() => remove(field.name)}
                    className="mt-8 text-red-500 hover:text-red-700"
                  />
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};