// src/modules/purchase-orders/components/PurchaseOrderList.tsx
import { Table, Tag, Button, Space, Tooltip, Form, Select, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  EyeOutlined, 
  EditOutlined,
} from '@ant-design/icons';
// import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PurchaseOrder, POStatus, POFilter } from '../../../types/purchase-order';
import { formatCurrency } from '../../../utils/format';

// Update the props interface to match what's being passed
interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  loading: boolean;
  total: number;
  onRefresh: () => void;
  onFilterChange: (filters: POFilter) => void;
}

export const PurchaseOrderList = ({
  orders,
  loading,
  total,
  onRefresh,
  onFilterChange,
}: PurchaseOrderListProps) => {
  const [form] = Form.useForm();

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (text, record) => (
        <Link to={`/purchase-orders/${record.id}`} className="text-blue-600 hover:text-blue-800">
          {text}
        </Link>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: ['vendor', 'name'],
      key: 'vendor',
    },
    {
      title: 'LOA No.',
      dataIndex: ['loa', 'loaNo'],
      key: 'loaNo',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value) => formatCurrency(Number(value)),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: POStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Link to={`/purchase-orders/${record.id}`}>
            <Button 
              icon={<EyeOutlined />}
              className="hover:text-blue-600"
            />
          </Link>
          {record.status === POStatus.DRAFT && (
            <Button 
              icon={<EditOutlined />}
              className="hover:text-green-600"
            />
          )}
        </Space>
      ),
    },
  ];

  const getStatusColor = (status: POStatus) => {
    const colors: Record<POStatus, string> = {
      [POStatus.DRAFT]: 'default',
      [POStatus.ISSUED]: 'processing',
      [POStatus.IN_PROGRESS]: 'warning',
      [POStatus.COMPLETED]: 'success',
      [POStatus.CANCELLED]: 'error',
    };
    return colors[status];
  };

  const handleFilter = (values: any) => {
    const filters: POFilter = {};
    if (values.status) filters.status = values.status;
    if (values.dateRange) {
      filters.startDate = values.dateRange[0].toDate();
      filters.endDate = values.dateRange[1].toDate();
    }
    onFilterChange(filters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Form
        form={form}
        layout="inline"
        className="mb-6"
        onFinish={handleFilter}
      >
        <Form.Item name="status" label="Status">
          <Select
            className="w-40"
            allowClear
            placeholder="Filter by status"
          >
            {Object.values(POStatus).map((status: POStatus) => (
              <Select.Option key={status} value={status}>
                {status.replace('_', ' ')}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="dateRange" label="Delivery Date">
          <DatePicker.RangePicker className="w-64" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Apply Filters
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={(pagination) => {
          // Handle pagination changes if needed
          onRefresh();
        }}
      />
    </div>
  );
};