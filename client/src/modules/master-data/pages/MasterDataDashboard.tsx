// src/modules/master-data/pages/MasterDataDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Spin,
  Select,
  Table,
  message,
  Typography,
  Space,
  Tooltip,
  Tag,
  Divider,
  Statistic
} from 'antd';
import {
  ShoppingOutlined,
  TeamOutlined,
  LinkOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { DashboardStats, MatchingData, TrendDataPoint } from '../../../types/master';
import { dummyStats, generateTrendData, generateMatchingData } from '../data/dummyData';

const { Title, Text } = Typography;

export const MasterDataDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [matchingData, setMatchingData] = useState<MatchingData[]>([]);
  const [selectedMatchType, setSelectedMatchType] = useState<string>('item-vendor');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);

  // Data fetching logic remains the same...
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(dummyStats);
        setTrendData(generateTrendData());
      } catch (error) {
        message.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchMatchingData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setMatchingData(generateMatchingData(selectedMatchType));
      } catch (error) {
        message.error('Failed to fetch matching data');
      }
    };

    fetchMatchingData();
  }, [selectedMatchType]);

  // Enhanced table columns with better styling and tooltips
  const matchingColumns = {
    'item-vendor': [
      {
        title: (
          <Space>
            <FileTextOutlined className="text-gray-400" />
            Item Code
          </Space>
        ),
        dataIndex: 'itemCode',
        key: 'itemCode',
        sorter: (a: any, b: any) => a.itemCode.localeCompare(b.itemCode),
        render: (text: string) => (
          <Text className="font-medium">{text}</Text>
        )
      },
      {
        title: (
          <Space>
            <FileTextOutlined className="text-gray-400" />
            Description
          </Space>
        ),
        dataIndex: 'itemDescription',
        key: 'itemDescription',
        render: (text: string) => (
          <Tooltip title={text}>
            <div className="truncate max-w-[300px]">{text}</div>
          </Tooltip>
        )
      },
      {
        title: (
          <Space>
            <TeamOutlined className="text-gray-400" />
            Vendor
          </Space>
        ),
        dataIndex: 'vendorName',
        key: 'vendorName',
        sorter: (a: any, b: any) => a.vendorName.localeCompare(b.vendorName)
      },
      {
        title: (
          <Space>
            <CalendarOutlined className="text-gray-400" />
            Match Date
          </Space>
        ),
        dataIndex: 'matchDate',
        key: 'matchDate',
        sorter: (a: any, b: any) => a.matchDate.localeCompare(b.matchDate),
        render: (date: string) => (
          <Text type="secondary">
            {new Date(date).toLocaleDateString()}
          </Text>
        )
      }
    ],
    // Similar enhancements for other column sets...
    'item-po': [
      {
        title: (
          <Space>
            <FileTextOutlined className="text-gray-400" />
            Item Code
          </Space>
        ),
        dataIndex: 'itemCode',
        key: 'itemCode',
        sorter: (a: any, b: any) => a.itemCode.localeCompare(b.itemCode),
        render: (text: string) => (
          <Text className="font-medium">{text}</Text>
        )
      },
      {
        title: (
          <Space>
            <FileTextOutlined className="text-gray-400" />
            Description
          </Space>
        ),
        dataIndex: 'itemDescription',
        key: 'itemDescription',
        render: (text: string) => (
          <Tooltip title={text}>
            <div className="truncate max-w-[300px]">{text}</div>
          </Tooltip>
        )
      },
      {
        title: (
          <Space>
            <ShoppingCartOutlined className="text-gray-400" />
            PO Number
          </Space>
        ),
        dataIndex: 'poNumber',
        key: 'poNumber',
        sorter: (a: any, b: any) => a.poNumber.localeCompare(b.poNumber)
      },
      {
        title: (
          <Space>
            <CalendarOutlined className="text-gray-400" />
            Match Date
          </Space>
        ),
        dataIndex: 'matchDate',
        key: 'matchDate',
        sorter: (a: any, b: any) => a.matchDate.localeCompare(b.matchDate),
        render: (date: string) => (
          <Text type="secondary">
            {new Date(date).toLocaleDateString()}
          </Text>
        )
      }
    ],
    'vendor-po': [
      {
        title: (
          <Space>
            <TeamOutlined className="text-gray-400" />
            Vendor
          </Space>
        ),
        dataIndex: 'vendorName',
        key: 'vendorName',
        sorter: (a: any, b: any) => a.vendorName.localeCompare(b.vendorName)
      },
      {
        title: (
          <Space>
            <ShoppingCartOutlined className="text-gray-400" />
            PO Number
          </Space>
        ),
        dataIndex: 'poNumber',
        key: 'poNumber',
        sorter: (a: any, b: any) => a.poNumber.localeCompare(b.poNumber)
      },
      {
        title: (
          <Space>
            <CalendarOutlined className="text-gray-400" />
            Match Date
          </Space>
        ),
        dataIndex: 'matchDate',
        key: 'matchDate',
        sorter: (a: any, b: any) => a.matchDate.localeCompare(b.matchDate),
        render: (date: string) => (
          <Text type="secondary">
            {new Date(date).toLocaleDateString()}
          </Text>
        )
      }
    ]
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary">Loading dashboard data...</Text>
        </Space>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} className="!mb-1">Master Data Analytics</Title>
          <Text type="secondary">Overview and insights of master data relationships</Text>
        </div>
      </div>

      {/* Statistics Cards */}
      {/* Statistics Cards Section */}
      {/* Statistics Cards Section */}
<Row gutter={[24, 24]} className="mb-6">
  {/* Total Items Card */}
  <Col xs={24} sm={12} md={6}>
    <Card loading={loading} className="hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <ShoppingOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
        <Statistic
          title="Total Items"
          value={stats.totalItems}
          className="flex-1"
        />
      </div>
    </Card>
  </Col>

  {/* Total Vendors Card */}
  <Col xs={24} sm={12} md={6}>
    <Card loading={loading} className="hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <TeamOutlined className="text-2xl mr-3 p-2 rounded-lg bg-green-50 text-green-500" />
        <Statistic
          title="Total Vendors"
          value={stats.totalVendors}
          className="flex-1"
        />
      </div>
    </Card>
  </Col>

  {/* Item-Vendor Matches Card */}
  <Col xs={24} sm={12} md={6}>
    <Card loading={loading} className="hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <LinkOutlined className="text-2xl mr-3 p-2 rounded-lg bg-purple-50 text-purple-500" />
        <Statistic
          title="Item-Vendor Matches"
          value={stats.itemVendorMatches}
          className="flex-1"
        />
      </div>
    </Card>
  </Col>

  {/* PO Matches Card */}
  <Col xs={24} sm={12} md={6}>
    <Card loading={loading} className="hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <ShoppingCartOutlined className="text-2xl mr-3 p-2 rounded-lg bg-orange-50 text-orange-500" />
        <Statistic
          title="PO Matches"
          value={stats.itemPOMatches + stats.vendorPOMatches}
          className="flex-1"
        />
      </div>
    </Card>
  </Col>
</Row>


      {/* Matching Data Table Section */}
      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <Space>
            <DatabaseOutlined className="text-xl text-blue-500" />
            <Title level={5} className="!mb-0">Matching Details</Title>
          </Space>
          <Select
            value={selectedMatchType}
            onChange={setSelectedMatchType}
            style={{ width: 200 }}
            options={[
              { label: 'Item-Vendor Matches', value: 'item-vendor' },
              { label: 'Item-PO Matches', value: 'item-po' },
              { label: 'Vendor-PO Matches', value: 'vendor-po' },
            ]}
          />
        </div>

        <Table
          columns={matchingColumns[selectedMatchType as keyof typeof matchingColumns]}
          dataSource={matchingData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} matches`
          }}
          className="border border-gray-200 rounded-lg overflow-hidden"
        />
      </Card>
    </div>
  );
};

export default MasterDataDashboard;