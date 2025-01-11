// src/modules/emd-tracking/components/EMDList.tsx
import { Table, Tag, Button, Space, Tooltip, Card, Input, Select, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  EyeOutlined, 
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import { EMDTracking, EMDStatus, EMDListProps } from '../../../types/emd';
import { formatCurrency } from '../../../utils/format';

const { RangePicker } = DatePicker;

export const EMDList = ({
  emds = [],
  loading = false,
  onRefresh,
  onStatusUpdate,
  onView,
  onFilterChange,
}: EMDListProps) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<EMDStatus | ''>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (onFilterChange) {
      onFilterChange({
        search: value,
        status: statusFilter as EMDStatus,
        dateRange: dateRange,
      });
    }
  };

  const handleStatusFilter = (value: EMDStatus | '') => {
    setStatusFilter(value);
    if (onFilterChange) {
      onFilterChange({
        search: searchText,
        status: value as EMDStatus,
        dateRange: dateRange,
      });
    }
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    if (onFilterChange) {
      onFilterChange({
        search: searchText,
        status: statusFilter as EMDStatus,
        dateRange: dates,
      });
    }
  };

  const getStatusColor = (status: EMDStatus): string => {
    const colors: Record<EMDStatus, string> = {
      [EMDStatus.PENDING]: 'default',
      [EMDStatus.SUBMITTED]: 'processing',
      [EMDStatus.VERIFIED]: 'success',
      [EMDStatus.RETURNED]: 'blue',
      [EMDStatus.FORFEITED]: 'error',
      [EMDStatus.OVERDUE]: ''
    };
    return colors[status];
  };

  const getAvailableActions = (status: EMDStatus) => {
    switch (status) {
      case EMDStatus.PENDING:
        return ['submit'];
      case EMDStatus.SUBMITTED:
        return ['verify', 'forfeit'];
      case EMDStatus.VERIFIED:
        return ['return', 'forfeit'];
      default:
        return [];
    }
  };

  const columns: ColumnsType<EMDTracking> = [
    {
      title: 'Tender No.',
      dataIndex: ['offer', 'tenderNo'],
      key: 'tenderNo',
      width: 150
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount) => formatCurrency(Number(amount)),
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: EMDStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
      filters: Object.values(EMDStatus).map(status => ({
        text: status.replace('_', ' '),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Submission Date',
      dataIndex: 'submissionDate',
      key: 'submissionDate',
      width: 150,
      render: (date: Date | undefined) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: 150,
      render: (date: Date | undefined) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => onView?.(record)}
              type="text"
            />
          </Tooltip>
          {record.status === EMDStatus.PENDING && (
            <Tooltip title="Mark as Submitted">
              <Button
                icon={<CheckCircleOutlined />}
                onClick={() => onStatusUpdate?.(record)}
                type="text"
              />
            </Tooltip>
          )}
          {record.status === EMDStatus.SUBMITTED && (
            <Tooltip title="Mark as Verified">
              <Button
                icon={<CheckCircleOutlined />}
                onClick={() => onStatusUpdate?.(record)}
                type="text"
                className="text-green-600 hover:text-green-700"
              />
            </Tooltip>
          )}
          {record.status === EMDStatus.VERIFIED && (
            <Tooltip title="Mark as Returned">
              <Button
                icon={<UndoOutlined />}
                onClick={() => onStatusUpdate?.(record)}
                type="text"
                className="text-blue-600 hover:text-blue-700"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="mt-6">
      <div className="mb-4">
        <Space size="middle" className="flex flex-wrap gap-4">
          <Input
            placeholder="Search tender no."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-48 md:w-64"
            allowClear
          />
          
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={handleStatusFilter}
            className="w-40 md:w-48"
            allowClear
          >
            {Object.values(EMDStatus).map((status) => (
              <Select.Option key={status} value={status}>
                {status.replace('_', ' ')}
              </Select.Option>
            ))}
          </Select>

          <RangePicker
            onChange={handleDateRangeChange}
            className="w-64 md:w-72"
          />

          <Tooltip title="Refresh">
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            />
          </Tooltip>
        </Space>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={emds}
          loading={loading}
          rowKey="id"
          pagination={{
            total: emds?.length || 0,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
            showQuickJumper: true,
          }}
          scroll={{ x: 1300 }}
          className="w-full"
          size="middle"
          locale={{
            emptyText: loading ? 'Loading...' : 'No EMDs available',
          }}
        />
      </div>
    </Card>
  );
};