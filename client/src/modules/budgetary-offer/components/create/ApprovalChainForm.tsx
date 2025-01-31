// src/components/create/ApprovalChainForm.tsx

import React, { useEffect, useState } from 'react';
import { Form, Select, Typography, Spin, Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { BOService } from '../../services/BOService';

const { Title } = Typography;

interface Approver {
  id: string;
  name: string;
  role: string;
}

interface ApprovalChainFormProps {
  form: any;
}

export const ApprovalChainForm: React.FC<ApprovalChainFormProps> = ({ form }) => {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setLoading(true);
        const response = await BOService.getApprovers();
        
        // Check if response has data and is an array
        if (response?.data && Array.isArray(response.data)) {
          setApprovers(response.data);
          
          // Initialize with first approver if none selected
          const currentApprovers = form.getFieldValue('approvers');
          if (!currentApprovers?.length && response.data.length > 0) {
            form.setFieldValue('approvers', [response.data[0].id]);
          }
        } else {
          message.error('Failed to load approvers data');
        }
      } catch (error) {
        console.error('Failed to fetch approvers:', error);
        message.error('Failed to load approvers');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovers();
  }, [form]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spin size="large" />
      </div>
    );
  }

  // If no approvers are loaded, show a message
  if (!approvers.length) {
    return (
      <div>
        <Title level={4}>Approval Chain</Title>
        <div className="text-center text-gray-500 py-4">
          No approvers available
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title level={4}>Approval Chain</Title>
      
      <Form.List 
        name="approvers"
        initialValue={[approvers[0]?.id]} // Set initial value if approvers exist
        rules={[
          {
            validator: async (_, approvers) => {
              if (!approvers || approvers.length === 0) {
                return Promise.reject(new Error('At least one approver is required'));
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.key} className="flex items-center gap-2">
                <Form.Item
                  {...field}
                  label={`Approver ${index + 1}`}
                  required
                  className="flex-1 mb-0"
                  rules={[
                    { required: true, message: 'Please select an approver' },
                    {
                      validator: (_, value) => {
                        const approversList = form.getFieldValue('approvers');
                        if (approversList?.filter((v: string) => v === value).length > 1) {
                          return Promise.reject(new Error('Duplicate approver selected'));
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Select an approver"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {approvers.map((approver) => (
                      <Select.Option 
                        key={approver.id} 
                        value={approver.id}
                        label={`${approver.name} (${approver.role})`}
                      >
                        <div className="flex flex-col">
                          <span>{approver.name}</span>
                          <span className="text-xs text-gray-500">{approver.role}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                
                {fields.length > 1 && (
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />} 
                    onClick={() => remove(field.name)}
                  />
                )}
              </div>
            ))}

            <Form.ErrorList errors={errors} />

            {approvers.length > fields.length && (
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Approver
              </Button>
            )}
          </div>
        )}
      </Form.List>
    </div>
  );
};

export default ApprovalChainForm;