// src/modules/purchase-orders/components/POForm.tsx
import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Select, 
  DatePicker, 
  InputNumber, 
  Button, 
  Space,
  Card,
  Divider,
  Row,
  Col,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  MinusCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { POCreateInput, POItem } from '../../../types/purchase-order';
import { purchaseOrderApi } from '../services/api';

interface POFormProps {
  initialValues?: Partial<POCreateInput>;
  onSubmit: (values: POCreateInput) => Promise<void>;
  loading?: boolean;
}

export const POForm: React.FC<POFormProps> = ({
  initialValues,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [totalValue, setTotalValue] = useState<number>(0);
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([]);
  const [items, setItems] = useState<Array<{ id: string; itemCode: string; description: string }>>([]);

  // Load vendors and items data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorsData, itemsData] = await Promise.all([
          purchaseOrderApi.getActiveVendors(),
          purchaseOrderApi.getActiveItems()
        ]);
        setVendors(vendorsData);
        setItems(itemsData);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    };
    fetchData();
  }, []);

  // Set initial values if provided
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        deliveryDate: initialValues.deliveryDate ? new Date(initialValues.deliveryDate) : undefined
      });
      if (initialValues.items) {
        calculateTotal(initialValues.items);
      }
    }
  }, [initialValues, form]);

  // Calculate total value when items change
  const calculateTotal = (items: any[] = []) => {
    const total = items.reduce((sum, item) => {
      const quantity = Number(item?.quantity) || 0;
      const unitPrice = Number(item?.unitPrice) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
    setTotalValue(total);
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.items) {
      calculateTotal(allValues.items);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const submitData: POCreateInput = {
        ...values,
        deliveryDate: values.deliveryDate?.toISOString() || new Date().toISOString(),
        value: totalValue,
        items: values.items?.map((item: { quantity: any; unitPrice: any; }) => ({
          ...item,
          totalPrice: (item.quantity || 0) * (item.unitPrice || 0)
        }))
      };

      await onSubmit(submitData);
    } catch (error) {
      // Form validation error, handled by form itself
      if (!(error instanceof Error)) {
        return;
      }
      throw error;
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      className="bg-white p-6 rounded-lg border border-gray-200"
    >
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item
            name="vendorId"
            label="Vendor"
            rules={[{ required: true, message: 'Please select a vendor' }]}
          >
            <Select
              placeholder="Select vendor"
              showSearch
              optionFilterProp="children"
              loading={vendors.length === 0}
            >
              {vendors.map(vendor => (
                <Select.Option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="loaId"
            label="LOA Reference"
            rules={[{ required: true, message: 'Please select an LOA' }]}
          >
            <Select
              placeholder="Select LOA"
              showSearch
              optionFilterProp="children"
            >
              {/* Add LOA options */}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="deliveryDate"
            label="Delivery Date"
            rules={[{ required: true, message: 'Please select delivery date' }]}
          >
            <DatePicker 
              className="w-full"
              onChange={(date) => {
                form.setFieldValue('deliveryDate', date);
              }}
              disabledDate={(current) => {
                return current && current.valueOf() < Date.now();
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">
        <Space>
          Order Items
          <Tooltip title="Add items to your purchase order. The total value will be calculated automatically.">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </Space>
      </Divider>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Card 
                key={field.key} 
                className="mb-4 bg-gray-50"
                size="small"
              >
                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Form.Item
                      {...field}
                      name={[field.name, 'itemId']}
                      rules={[{ required: true, message: 'Please select an item' }]}
                      className="mb-0"
                    >
                      <Select 
                        placeholder="Select item"
                        showSearch
                        optionFilterProp="children"
                        loading={items.length === 0}
                      >
                        {items.map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {`${item.itemCode} - ${item.description}`}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'quantity']}
                      rules={[{ required: true, message: 'Required' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        placeholder="Quantity"
                        min={1}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'unitPrice']}
                      rules={[{ required: true, message: 'Required' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        placeholder="Unit Price"
                        className="w-full"
                        formatter={value => `₹ ${value}`}
                        parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Button 
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(field.name)}
                    />
                  </Col>
                </Row>
              </Card>
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

      <Card size="small" className="bg-gray-50">
        <div className="flex justify-between items-center">
          <Button 
            type="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            Submit
          </Button>
          <div className="text-xl font-semibold">
            Total Value: ₹ {totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </Card>
    </Form>
  );
};

export default POForm;