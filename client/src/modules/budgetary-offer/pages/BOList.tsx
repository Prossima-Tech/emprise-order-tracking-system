import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Input, 
  DatePicker, 
  Select, 
  Button, 
  message, 
  Space, 
  Typography,
  Tooltip,
  Dropdown,

  Divider
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined,
  FilterOutlined,

  EllipsisOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SortAscendingOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { boService } from '../services/boServices';
import type { MenuProps } from 'antd';
import { BudgetaryOfferStatus } from '@emprise/shared/src/types/budgetary-offer';


const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const BOList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `Total ${total} offers`
  });

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const response = await boService.listOffers({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        status: selectedStatus,
        authority: selectedAuthority,
        dateRange: dateRange,
        ...params
      });
      
      setData(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total
      }));
    } catch (error) {
      message.error('Failed to fetch budgetary offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, searchText, selectedStatus, selectedAuthority, dateRange]);

  const handleDelete = async (id: string) => {
    try {
      await boService.deleteOffer(id);
      message.success('Offer deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete offer');
    }
  };

  const getActionMenu = (record: any): MenuProps => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'View Details',
        onClick: () => navigate(`/budgetary-offers/${record.id}`)
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        disabled: record.status !== 'DRAFT',
        onClick: () => navigate(`/budgetary-offers/edit/${record.id}`)
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        disabled: record.status !== 'DRAFT',
        onClick: () => handleDelete(record.id)
      }
    ]
  });

  const columns = [
    {
      title: (
        <Space>
          Reference No.
          <SortAscendingOutlined className="text-gray-400" />
        </Space>
      ),
      dataIndex: 'referenceNo',
      key: 'referenceNo',
      width: '15%',
      sorter: true,
      render: (text: string) => (
        <Text className="font-medium">{text}</Text>
      ),
    },
    {
      title: 'From Authority',
      dataIndex: 'fromAuthority',
      key: 'fromAuthority',
      width: '20%',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate max-w-[250px]">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'To Authority',
      dataIndex: 'toAuthority',
      key: 'toAuthority',
      width: '20%',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate max-w-[250px]">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'EMD Amount',
      dataIndex: ['emdDetails', 'amount'],
      key: 'emdAmount',
      width: '15%',
      sorter: true,
      render: (amount: number) => (
        <Text className="font-mono">
          ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      filters: Object.values(BudgetaryOfferStatus).map(status => ({
        text: status,
        value: status,
      })),
      render: (status: BudgetaryOfferStatus) => <StatusBadge status={status} />,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      sorter: true,
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text type="secondary">
            {new Date(date).toLocaleDateString()}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '8%',
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleExport = () => {
    // Add export logic here
    message.success('Exporting data...');
  };

  return (
    <div className="p-3">
      {/* <Card className=""> */}
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={4} className="!mb-1">Budgetary Offers</Title>
            <Text type="secondary">View and manage all budgetary offers</Text>
          </div>
          <Space>
            <Tooltip title="Export to Excel">
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                Export
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/budgetary-offers/create')}
            >
              Create New
            </Button>
          </Space>
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <Input
            placeholder="Search by reference or authority"
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-64"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <RangePicker 
            className="w-64"
            onChange={setDateRange}
            placeholder={['Start Date', 'End Date']}
          />
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Status"
            className="w-40"
            allowClear
          >
            <Select.Option value="">All Status</Select.Option>
            {Object.values(BudgetaryOfferStatus).map(status => (
              <Select.Option key={status} value={status}>
                {status}
              </Select.Option>
            ))}
          </Select>
          <Select
            value={selectedAuthority}
            onChange={setSelectedAuthority}
            placeholder="Authority"
            className="w-48"
            allowClear
            showSearch
          >
            <Select.Option value="">All Authorities</Select.Option>
            {/* Add authority options here */}
          </Select>
          <Button 
            icon={<FilterOutlined />}
            onClick={() => {
              setSearchText('');
              setDateRange(null);
              setSelectedStatus('');
              setSelectedAuthority('');
            }}
          >
            Reset Filters
          </Button>
        </div>

        <Divider className="my-4" />

        {/* Table Section */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={pagination}
          onChange={(newPagination) => {
            setPagination({
              ...pagination,
              current: newPagination.current || 1,
              pageSize: newPagination.pageSize || 10,
            });
            // Handle sorting and filtering here
          }}
          scroll={{ x: 1200 }}
          className="border border-gray-200 rounded-lg overflow-hidden"
        />
      {/* </Card> */}
    </div>
  );
};

export default BOList;