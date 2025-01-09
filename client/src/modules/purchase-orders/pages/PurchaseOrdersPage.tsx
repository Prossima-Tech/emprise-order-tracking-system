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
  Row,
  Col,
  Card,
  Statistic,
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
  ExportOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { mockPurchaseOrderApi as purchaseOrderApi } from '../services/mockApi';
import type { MenuProps } from 'antd';
import { 
  POFilter, 
  POStatus, 
  PurchaseOrder,
  POStatistics 
} from '@emprise/shared/src/types/purchase-order';  
import { toNumber } from '../../../utils/decimal';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [statistics, setStatistics] = useState<POStatistics | null>(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedStatus, setSelectedStatus] = useState<POStatus | undefined>(undefined);
  const [selectedVendorId, setSelectedVendorId] = useState<string | undefined>(undefined);
  const [selectedLoaId, setSelectedLoaId] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `Total ${total} orders`
  });

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      
      // Construct filter object according to POFilter interface
      const filters: POFilter = {
        startDate: dateRange[0] || undefined,
        endDate: dateRange[1] || undefined,
        status: selectedStatus,
        vendorId: selectedVendorId,
        loaId: selectedLoaId,
        ...params
      };

      // Add pagination params separately from filter object
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await purchaseOrderApi.listPOs(queryParams);
      setData(response.items);
      setPagination(prev => ({
        ...prev,
        total: response.total
      }));
    } catch (error) {
      message.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const stats = await purchaseOrderApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      message.error('Failed to fetch statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStatistics();
  }, [pagination.current, pagination.pageSize, selectedStatus, selectedVendorId, selectedLoaId, dateRange]);

  const handleDelete = async () => {
    try {
      // await purchaseOrderApi.deletePO(id);
      message.success('Purchase order deleted successfully');
      fetchData();
      fetchStatistics();
    } catch (error) {
      message.error('Failed to delete purchase order');
    }
  };

  const getActionMenu = (record: PurchaseOrder): MenuProps => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'View Details',
        onClick: () => navigate(`/purchase-orders/${record.id}`)
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        disabled: record.status !== POStatus.DRAFT,
        onClick: () => navigate(`/purchase-orders/edit/${record.id}`)
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        disabled: record.status !== POStatus.DRAFT,
        onClick: () => handleDelete()
      }
    ]
  });

  const columns = [
    {
      title: (
        <Space>
          PO Number
          <SortAscendingOutlined className="text-gray-400" />
        </Space>
      ),
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: '15%',
      sorter: true,
      render: (text: string) => (
        <Text className="font-medium">{text}</Text>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: ['vendor', 'name'],
      key: 'vendorName',
      width: '20%',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate max-w-[250px]">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'LOA Number',
      dataIndex: ['loa', 'loaNo'],
      key: 'loaNo',
      width: '15%',
      render: (text: string) => (
        <Text>{text}</Text>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: '15%',
      sorter: true,
      render: (value: number) => (
        <Text className="font-mono">
          ₹{toNumber(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: '15%',
      sorter: true,
      render: (date: Date) => (
        <Tooltip title={date.toLocaleString()}>
          <Text type="secondary">
            {date.toLocaleDateString()}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      filters: Object.values(POStatus).map((status: POStatus) => ({
        text: status.replace(/_/g, ' '),
        value: status,
      })),
      render: (status: POStatus) => <StatusBadge status={status} />,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      sorter: true,
      render: (date: Date) => (
        <Tooltip title={date.toLocaleString()}>
          <Text type="secondary">
            {date.toLocaleDateString()}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '8%',
      fixed: 'right' as const,
      render: (_: any, record: PurchaseOrder) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleExport = () => {
    message.success('Exporting data...');
    // Implement export logic here
  };

  return (
    <div className="p-3">
      {/* Statistics Section */}

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} className="!mb-1">Purchase Orders</Title>
          <Text type="secondary">View and manage all purchase orders</Text>
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
            onClick={() => navigate('/purchase-orders/create')}
          >
            Create New
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <ShoppingCartOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
              <Statistic
                title="Total POs"
                value={statistics?.totalCount || 0}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <DollarCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-green-50 text-green-500" />
              <Statistic
                title="Total Value"
                value={toNumber(statistics?.totalValue)}
                precision={2}
                prefix="₹"
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <ClockCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-orange-50 text-orange-500" />
              <Statistic
                title="Pending Delivery"
                value={statistics?.pendingDelivery || 0}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-green-50 text-green-500" />
              <Statistic
                title="Completed"
                value={statistics?.completed || 0}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
      </Row>
      {/* Filters Section */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <Input
          placeholder="Search by PO number"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="w-64"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
        <RangePicker 
          className="w-64"
          onChange={(dates) => {
            setDateRange(dates ? [dates[0]?.toDate() || null, dates[1]?.toDate() || null] : [null, null]);
          }}
          placeholder={['Start Date', 'End Date']}
        />
        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          placeholder="Status"
          className="w-40"
          allowClear
        >
          <Select.Option value={undefined}>All Status</Select.Option>
          {Object.values(POStatus).map((status: POStatus) => (
            <Select.Option key={status} value={status}>
              {status.replace(/_/g, ' ')}
            </Select.Option>
          ))}
        </Select>
        <Select
          value={selectedVendorId}
          onChange={setSelectedVendorId}
          placeholder="Vendor"
          className="w-48"
          allowClear
          showSearch
        >
          <Select.Option value={undefined}>All Vendors</Select.Option>
          {/* Add vendor options here */}
        </Select>
        <Button 
          icon={<FilterOutlined />}
          onClick={() => {
            setSearchText('');
            setDateRange([null, null]);
            setSelectedStatus(undefined);
            setSelectedVendorId(undefined);
            setSelectedLoaId(undefined);
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
        onChange={(newPagination, filters, sorter) => {
          setPagination({
            ...pagination,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 10,
          });
          
          // Handle status filter if applied
          if (filters.status && filters.status.length > 0) {
            setSelectedStatus(filters.status[0] as POStatus);
          }

          // Handle sorting if applied
          if (sorter && !Array.isArray(sorter)) {
            // Add sorting logic here based on your API requirements
          }
        }}
        scroll={{ x: 1200 }}
        className="border border-gray-200 rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default PurchaseOrdersPage;