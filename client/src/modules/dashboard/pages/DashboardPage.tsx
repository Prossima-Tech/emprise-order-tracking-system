import React from 'react';
import { Card, Row, Col, Typography, Space, Table, Avatar, Progress, Select, Badge, Button } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  UserOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  EllipsisOutlined,
  BarChartOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { DashboardChart } from '../components/DashboardChart';

const { Title, Text } = Typography;

// Types for our dashboard components
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  prefix?: string;
  trend: number;
  isPositive: boolean;
  color: string;
  subtitle?: string;
}

interface ActivityItem {
  key: string;
  user: string;
  action: string;
  status: 'success' | 'processing' | 'warning';
  timestamp: string;
  amount: string;
  progress: number;
}

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ 
  icon, title, value, prefix, trend, isPositive, color, subtitle 
}) => (
  <Card 
    bordered={false}
    className="rounded-xl hover:shadow-md transition-all duration-300"
  >
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${color} bg-opacity-10`}>
          <span className={`text-xl ${color.replace('bg-', 'text-')}`}>{icon}</span>
        </div>
        <Badge 
          className="mr-2" 
          color={isPositive ? 'green' : 'red'} 
          dot 
        />
      </div>
      
      <div>
        <Text className="text-gray-500 text-sm block mb-1">{title}</Text>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">
            {prefix}{value.toLocaleString()}
          </span>
          <span className={`flex items-center text-xs px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span className="ml-1">{Math.abs(trend)}%</span>
          </span>
        </div>
        {subtitle && (
          <Text type="secondary" className="text-xs mt-1 block">
            {subtitle}
          </Text>
        )}
      </div>
    </div>
  </Card>
);

// Performance Card Component
const PerformanceCard: React.FC<{
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}> = ({ title, value, change, trend }) => (
  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300">
    <Text className="text-gray-600 block mb-2">{title}</Text>
    <Title level={3} className="!mb-1">{value}</Title>
    <Text type={trend === 'up' ? 'success' : 'danger'}>{change}</Text>
  </div>
);

export const DashboardPage: React.FC = () => {
  // Dashboard data
  const stats = [
    {
      icon: <DollarCircleOutlined />,
      title: "Total Revenue",
      value: 145000,
      prefix: "₹",
      trend: 12.5,
      isPositive: true,
      color: 'bg-blue-500',
      subtitle: "₹120,000 previous month"
    },
    {
      icon: <ShoppingCartOutlined />,
      title: "Active Orders",
      value: 24,
      trend: 8.2,
      isPositive: true,
      color: 'bg-violet-500',
      subtitle: "18 previous month"
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Pending Approvals",
      value: 12,
      trend: -5.1,
      isPositive: false,
      color: 'bg-amber-500',
      subtitle: "15 previous month"
    },
    {
      icon: <BarChartOutlined />,
      title: "Conversion Rate",
      value: 68,
      trend: 15.3,
      isPositive: true,
      color: 'bg-green-500',
      subtitle: "55% previous month"
    }
  ];

  const recentActivities: ActivityItem[] = [
    {
      key: '1',
      user: 'John Doe',
      action: 'Created Purchase Order',
      status: 'success',
      timestamp: '2 hours ago',
      amount: '₹24,500',
      progress: 100
    },
    {
      key: '2',
      user: 'Jane Smith',
      action: 'Updated LOA',
      status: 'processing',
      timestamp: '4 hours ago',
      amount: '₹12,300',
      progress: 60
    },
    {
      key: '3',
      user: 'Mike Johnson',
      action: 'Submitted EMD',
      status: 'warning',
      timestamp: '5 hours ago',
      amount: '₹8,900',
      progress: 30
    }
  ];

  const activityColumns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (text: string) => (
        <Space>
          <Avatar 
            size="small"
            icon={<UserOutlined />} 
            className="bg-gradient-to-r from-blue-400 to-blue-600"
          />
          <div className="flex flex-col">
            <Text strong className="text-sm">{text}</Text>
            <Text type="secondary" className="text-xs">User</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Activity',
      dataIndex: 'action',
      key: 'action',
      render: (text: string, record: ActivityItem) => (
        <div className="flex flex-col gap-1">
          <Text className="text-sm">{text}</Text>
          <Progress 
            percent={record.progress} 
            size="small" 
            status={record.status === 'warning' ? 'exception' : 
                    record.status === 'success' ? 'success' : 'active'} 
            showInfo={false}
            strokeWidth={4}
            className="!mb-0"
          />
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: string) => (
        <Text strong className="text-sm font-mono">{text}</Text>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => (
        <Text type="secondary" className="text-xs">{text}</Text>
      ),
    }
  ];

  return (
    <div className="space-y-6 p-3">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} className="!mb-1">Welcome back, Admin</Title>
          <Text type="secondary">Here's what's happening with your business today.</Text>
        </div>
        <Select defaultValue="today" className="w-32">
          <Select.Option value="today">Today</Select.Option>
          <Select.Option value="week">This Week</Select.Option>
          <Select.Option value="month">This Month</Select.Option>
        </Select>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} className="mb-6">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      {/* Main Content Area */}
      <Row gutter={[16, 16]}>
        {/* Chart Section */}
        <Col xs={24} lg={16}>
          <Card 
            className="rounded-xl"
            bordered={false}
            title={
              <div className="flex justify-between items-center">
                <Space align="center">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"/>
                  <Text strong className="text-lg">Revenue Overview</Text>
                </Space>
                <Space>
                  <Select defaultValue="yearly" className="w-32">
                    <Select.Option value="yearly">Yearly</Select.Option>
                    <Select.Option value="monthly">Monthly</Select.Option>
                    <Select.Option value="weekly">Weekly</Select.Option>
                  </Select>
                  <Button type="text" icon={<EllipsisOutlined />} />
                </Space>
              </div>
            }
          >
            <div className="h-[400px]">
              <DashboardChart />
            </div>
          </Card>
        </Col>

        {/* Side Section */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" className="w-full" size="middle">
            {/* Recent Activities */}
            <Card 
              className="rounded-xl"
              bordered={false}
              title={
                <Space align="center">
                  <div className="w-1 h-6 bg-violet-500 rounded-full"/>
                  <Text strong className="text-lg">Recent Activities</Text>
                </Space>
              }
              extra={<Button type="text" icon={<EllipsisOutlined />} />}
            >
              <Table 
                columns={activityColumns} 
                dataSource={recentActivities}
                pagination={false}
                size="small"
              />
            </Card>

            {/* Quick Actions */}
            <Card
              className="rounded-xl"
              bordered={false}
              title={
                <Space align="center">
                  <div className="w-1 h-6 bg-green-500 rounded-full"/>
                  <Text strong className="text-lg">Quick Actions</Text>
                </Space>
              }
            >
              <Space direction="vertical" className="w-full" size="middle">
                <Button type="primary" block>Create New Order</Button>
                <Button block>Generate Report</Button>
                <Button block>Manage Inventory</Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Card 
        className="rounded-xl"
        bordered={false}
        title={
          <Space align="center">
            <div className="w-1 h-6 bg-amber-500 rounded-full"/>
            <Text strong className="text-lg">Performance Metrics</Text>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <PerformanceCard
              title="Average Order Value"
              value="₹12,450"
              change="+15% vs last month"
              trend="up"
            />
          </Col>
          <Col xs={24} md={8}>
            <PerformanceCard
              title="Customer Satisfaction"
              value="92%"
              change="+5% vs target"
              trend="up"
            />
          </Col>
          <Col xs={24} md={8}>
            <PerformanceCard
              title="Processing Time"
              value="2.4 Days"
              change="-8% vs last month"
              trend="down"
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DashboardPage;