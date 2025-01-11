// src/modules/budgetary-offer/components/BudgetaryOfferList.tsx
import { Table, Tag, Button, Space, Tooltip, Card, Input, Select, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  EyeOutlined, 
  EditOutlined, 
  SearchOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { useState } from 'react';
import { BudgetaryOffer, BudgetaryOfferStatus } from '@emprise/shared/src/types/budgetary-offer';
import { formatCurrency } from '../../../utils/format';

const { RangePicker } = DatePicker;

interface BudgetaryOfferListProps {
  offers?: BudgetaryOffer[];
  loading: boolean;
  onRefresh: () => void;
  onView?: (offer: BudgetaryOffer) => void;
  onEdit?: (offer: BudgetaryOffer) => void;
  onFilterChange?: (filters: any) => void;
}

export const BudgetaryOfferList = ({
  offers = [],
  loading = false,
  onRefresh,
  onView,
  onEdit,
  onFilterChange,
}: BudgetaryOfferListProps) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<BudgetaryOfferStatus | ''>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (onFilterChange) {
      onFilterChange({
        search: value,
        status: statusFilter,
        dateRange: dateRange,
      });
    }
  };

  const handleStatusFilter = (value: BudgetaryOfferStatus | '') => {
    setStatusFilter(value);
    if (onFilterChange) {
      onFilterChange({
        search: searchText,
        status: value,
        dateRange: dateRange,
      });
    }
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    if (onFilterChange) {
      onFilterChange({
        search: searchText,
        status: statusFilter,
        dateRange: dates,
      });
    }
  };

  const handleView = (record: BudgetaryOffer) => {
    if (onView) {
      onView(record);
    }
  };

  const handleEdit = (record: BudgetaryOffer) => {
    if (onEdit) {
      onEdit(record);
    }
  };

  const getStatusColor = (status: BudgetaryOfferStatus): string => {
    const colors: Record<BudgetaryOfferStatus, string> = {
      [BudgetaryOfferStatus.DRAFT]: 'default',
      [BudgetaryOfferStatus.SUBMITTED]: 'processing',
      [BudgetaryOfferStatus.APPROVED]: 'success',
      [BudgetaryOfferStatus.REJECTED]: 'error',
    };
    return colors[status] || 'default';
  };

  const columns: ColumnsType<BudgetaryOffer> = [
    {
      title: 'Tender No.',
      dataIndex: 'tenderNo',
      key: 'tenderNo',
      width: 150,
      sorter: (a, b) => a.tenderNo.localeCompare(b.tenderNo),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number) => formatCurrency(amount),
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
    },
    {
      title: 'EMD Amount',
      dataIndex: 'emdAmount',
      key: 'emdAmount',
      width: 150,
      render: (amount: number) => formatCurrency(amount),
      sorter: (a, b) => Number(a.emdAmount) - Number(b.emdAmount),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: BudgetaryOfferStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
      filters: Object.values(BudgetaryOfferStatus).map(status => ({
        text: status.replace('_', ' '),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Created By',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      width: 150,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              type="text"
            />
          </Tooltip>
          {record.status === BudgetaryOfferStatus.DRAFT && (
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                type="text"
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
            {Object.values(BudgetaryOfferStatus).map((status) => (
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
          dataSource={offers}
          loading={loading}
          rowKey="id"
          pagination={{
            total: offers?.length || 0,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
            showQuickJumper: true,
          }}
          scroll={{ x: 1300 }}
          className="w-full"
          size="middle"
          locale={{
            emptyText: loading ? 'Loading...' : 'No data available',
          }}
        />
      </div>
    </Card>
  );
};