// src/components/create/WorkItemsForm.tsx

import React from 'react';
import { Form, Input, InputNumber, Button, Card, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface WorkItemsFormProps {
  form: any;
}

export const WorkItemsForm: React.FC<WorkItemsFormProps> = ({ form }) => {
  return (
    <>
      <Title level={4}>Work Items</Title>
      <Form.List
        name="workItems"
        rules={[
          {
            validator: async (_, workItems) => {
              if (!workItems || workItems.length === 0) {
                return Promise.reject(new Error('At least one work item is required'));
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} className="mb-4" size="small">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                    label="Description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                  >
                    <Input maxLength={500} />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'quantity']}
                    label="Quantity"
                    rules={[{ required: true, message: 'Please enter quantity' }]}
                  >
                    <InputNumber min={0.01} className="w-full" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'unitOfMeasurement']}
                    label="Unit of Measurement"
                    rules={[{ required: true, message: 'Please enter unit' }]}
                  >
                    <Input maxLength={50} />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'baseRate']}
                    label="Base Rate"
                    rules={[{ required: true, message: 'Please enter base rate' }]}
                  >
                    <InputNumber
                      min={0.01}
                      className="w-full"
                      formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value: string | undefined) => {
                        const parsed = value?.replace(/₹\s?|(,*)/g, '');
                        return parsed ? Number(parsed) : 0;
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'taxRate']}
                    label="Tax Rate (%)"
                    rules={[{ required: true, message: 'Please enter tax rate' }]}
                  >
                    <InputNumber min={0} max={100} className="w-full" />
                  </Form.Item>

                  {fields.length > 1 && (
                    <Button
                      type="text"
                      className="text-red-500"
                      onClick={() => remove(name)}
                      icon={<MinusCircleOutlined />}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            <Form.ErrorList errors={errors} />

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Work Item
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
};

export default WorkItemsForm;