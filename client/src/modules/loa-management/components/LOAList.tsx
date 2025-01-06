// src/modules/loa-management/components/LOAList.tsx
import { Table, Tag, Button, Input, Select, Space, Tooltip } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
import type { LOA, LOAStatus } from '@emprise/shared/src/types/loa';
import { formatCurrency } from '../../../utils/format';

interface LOAListProps {
  loas: LOA[];
  loading: boolean;
  onRefresh: () => void;
  onViewDetails: (loa: LOA) => void;
}

export const LOAList = ({ loas, loading, onRefresh, onViewDetails }: LOAListProps) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<LOAStatus | ''>('');

  const filteredLOAs = useMemo(() => {
    return loas.filter(loa => {
      const matchesSearch = 
        loa.loaNo.toLowerCase().includes(searchText.toLowerCase()) ||
        loa.projectCode.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = !statusFilter || loa.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [loas, searchText, statusFilter]);

  const columns = [
    {
      title: 'LOA No.',
      dataIndex: 'loaNo',
      key: 'loaNo',
      width: 150,
    },
    {
      title: 'Project Code',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 150,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: LOAStatus) => (
        <Tag color={getStatusColor(status)} className="px-3 py-1">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: LOA) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewDetails(record)}
              className="text-blue-600 hover:text-blue-700"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-gray-600 hover:text-gray-700"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getStatusColor = (status: LOAStatus) => {
    const colors: Record<LOAStatus, string> = {
      ACTIVE: 'green',
      COMPLETED: 'blue',
      CANCELLED: 'red',
    };
    return colors[status];
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by LOA No. or Project Code"
          prefix={<SearchOutlined className="text-gray-400" />}
          onChange={e => setSearchText(e.target.value)}
          className="max-w-md"
        />
        <Select
          placeholder="Filter by Status"
          allowClear
          className="w-48"
          onChange={value => setStatusFilter(value)}
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredLOAs}
        loading={loading}
        rowKey="id"
        pagination={{
          total: filteredLOAs.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: total => `Total ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};