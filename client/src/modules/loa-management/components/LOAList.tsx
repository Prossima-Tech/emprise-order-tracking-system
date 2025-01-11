// src/modules/loa-management/components/LOAList.tsx
import { Table, Tag, Button, Input, Select, Space, Tooltip, Typography, MenuProps, Dropdown } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  FilterOutlined,
  FileTextOutlined,
  ProjectOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  EllipsisOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useState, useMemo } from 'react';
import type { LOA, LOAStatus } from '../../../types/loa';
import { formatCurrency } from '../../../utils/format';

const { Text } = Typography;

interface LOAListProps {
  loas: LOA[];
  loading: boolean;
  onRefresh: () => void;
  onViewDetails: (loa: LOA) => void;
}

export const LOAList = ({ loas, loading, onViewDetails }: LOAListProps) => {
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
      title: (
        <Space>
          <FileTextOutlined className="text-gray-400" />
          LOA No.
        </Space>
      ),
      dataIndex: 'loaNo',
      key: 'loaNo',
      width: 150,
      render: (text: string) => (
        <Text className="font-medium">{text}</Text>
      ),
    },
    {
      title: (
        <Space>
          <ProjectOutlined className="text-gray-400" />
          Project Code
        </Space>
      ),
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
    },
    {
      title: (
        <Space>
          <TeamOutlined className="text-gray-400" />
          Department
        </Space>
      ),
      dataIndex: 'department',
      key: 'department',
      width: 150,
      render: (text: string) => (
        <Tooltip title={`Department: ${text}`}>
          <div className="truncate max-w-[200px]">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: (
        <Space>
          <DollarOutlined className="text-gray-400" />
          Value
        </Space>
      ),
      dataIndex: 'value',
      key: 'value',
      width: 150,
      render: (value: number) => (
        <Text className="font-mono">{formatCurrency(value)}</Text>
      ),
    },
    {
      title: (
        <Space>
          <ClockCircleOutlined className="text-gray-400" />
          Status
        </Space>
      ),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: LOAStatus) => {
        const statusConfig: Record<LOAStatus, { color: string; icon: React.ReactNode }> = {
          ACTIVE: { color: 'green', icon: <ClockCircleOutlined /> },
          COMPLETED: { color: 'blue', icon: <CheckCircleOutlined /> },
          CANCELLED: { color: 'red', icon: <CloseCircleOutlined /> }
        };

        return (
          <Tag 
            color={statusConfig[status].color} 
            className="px-3 py-1 rounded-full"
            icon={statusConfig[status].icon}
          >
            {status.replace(/_/g, ' ')}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: LOA) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const getActionMenu = (record: LOA): MenuProps => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'View Details',
        onClick: () => onViewDetails(record)
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        disabled: record.status !== 'ACTIVE'
      },
      {
        type: 'divider'
      },
      {
        key: 'print',
        icon: <PrinterOutlined />,
        label: 'Print',
      }
    ]
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <Input
          placeholder="Search by LOA No. or Project Code"
          prefix={<SearchOutlined className="text-gray-400" />}
          onChange={e => setSearchText(e.target.value)}
          className="w-64"
          allowClear
        />
        <Select
          placeholder="Filter by Status"
          allowClear
          className="w-40"
          onChange={value => setStatusFilter(value)}
          value={statusFilter}
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
        />
        <Button 
          icon={<FilterOutlined />}
          onClick={() => {
            setSearchText('');
            setStatusFilter('');
          }}
        >
          Reset Filters
        </Button>
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
          showQuickJumper: true,
          showTotal: total => `Total ${total} LOAs`,
        }}
        className="border border-gray-200 rounded-lg overflow-hidden"
      />
    </div>
  );
};