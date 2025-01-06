// src/modules/loa-management/components/AmendmentList.tsx
import { useState } from 'react';
import { 
  Button, 
  Table, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  DatePicker,
  message 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { loaApi } from '../services/api';
import type { LOAAmendment, LOAAmendmentInput } from '@emprise/shared/src/types/loa';
import { formatCurrency } from '../../../utils/format';
import { useQuery } from '../../../hooks/useQuery';

interface AmendmentListProps {
  loaId: string;
}

export const AmendmentList: React.FC<AmendmentListProps> = ({ loaId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LOAAmendmentInput>();

  const { 
    data: amendmentsData, 
    loading: isLoading, 
    refetch 
  } = useQuery<LOAAmendment[]>({
    queryFn: () => loaApi.getAmendments(loaId),
  });

  // Ensure we always have an array, even if data is null
  const amendments: readonly LOAAmendment[] = amendmentsData ?? [];

  const handleCreateAmendment = async (values: LOAAmendmentInput) => {
    try {
      setLoading(true);
      await loaApi.recordAmendment(loaId, values);
      message.success('Amendment recorded successfully');
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error.message || 'Failed to record amendment');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Amendment No.',
      dataIndex: 'amendmentNo',
      key: 'amendmentNo',
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'amendmentType',
      key: 'amendmentType',
      width: 150,
    },
    {
      title: 'Additional Value',
      dataIndex: 'additionalValue',
      key: 'additionalValue',
      width: 150,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="px-3 py-1">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Recorded By',
      dataIndex: ['recordedBy', 'name'],
      key: 'recordedBy',
      width: 150,
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'gold',
      APPROVED: 'green',
      REJECTED: 'red',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Amendment
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={amendments}
        loading={isLoading}
        rowKey="id"
        className="shadow-sm"
        pagination={{
          total: amendments.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: total => `Total ${total} items`,
        }}
      />

      <Modal
        title="Record Amendment"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAmendment}
          className="mt-4"
        >
          <Form.Item
            name="amendmentType"
            label="Amendment Type"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="additionalValue"
            label="Additional Value"
            rules={[{ required: true }]}
          >
            <InputNumber
              className="w-full"
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="effectiveDate"
            label="Effective Date"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="scopeChanges"
            label="Scope Changes"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};