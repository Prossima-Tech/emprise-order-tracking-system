// src/modules/dashboard/pages/DashboardPage.tsx
import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Table, Badge, Avatar, Progress, Select } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  UserOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { DashboardChart } from '../components/DashboardChart';
import { PageTransition } from '../../../components/shared/PageTransition';

const { Title, Text } = Typography;

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  prefix?: string;
  trend: number;
  isPositive: boolean;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, prefix, trend, isPositive, color }) => (
  <Card 
    bordered={false}
    className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center gap-4">
      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${color} bg-opacity-20`}>
        <span className={`text-xl ${color.replace('bg-', 'text-')}`}>{icon}</span>
      </div>
      <div className="flex-1">
        <Text className="text-gray-500 text-sm">{title}</Text>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-2xl font-semibold">
            {prefix}{value.toLocaleString()}
          </span>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span>{Math.abs(trend)}%</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const stats = [
    {
      icon: <DollarCircleOutlined />,
      title: "Total Purchase Orders",
      value: 145000,
      prefix: "₹",
      trend: 12.5,
      isPositive: true,
      color: 'bg-blue-500'
    },
    {
      icon: <FileTextOutlined />,
      title: "Active LOAs",
      value: 24,
      trend: 8.2,
      isPositive: true,
      color: 'bg-violet-500'
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Pending Approvals",
      value: 12,
      trend: -5.1,
      isPositive: false,
      color: 'bg-amber-500'
    },
    {
      icon: <CloudUploadOutlined />,
      title: "EMD Submissions",
      value: 8,
      trend: 15.3,
      isPositive: true,
      color: 'bg-green-500'
    }
  ];

  const recentActivities = [
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
    },
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (text: string) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            className="bg-gradient-to-r from-blue-400 to-blue-600"
          />
          <div className="flex flex-col">
            <Text strong>{text}</Text>
            <Text type="secondary" className="text-xs">User</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Action & Status',
      dataIndex: 'action',
      key: 'action',
      render: (text: string, record: any) => (
        <div className="flex flex-col gap-1">
          <Text>{text}</Text>
          <Progress 
            percent={record.progress} 
            size="small" 
            status={record.status === 'warning' ? 'exception' : record.status === 'success' ? 'success' : 'active'} 
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => (
        <Text strong className="font-mono">{amount}</Text>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => (
        <Text type="secondary" className="text-sm">{time}</Text>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-8">
          <div className="mb-8">
            <Title level={2} className="!mb-2">Welcome back, Admin</Title>
            <Text type="secondary" className="text-lg">Here's what's happening with your business today.</Text>
          </div>

          {/* Stats Grid */}
          <Row gutter={[24, 24]} className="mb-8">
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <StatCard {...stat} />
              </Col>
            ))}
          </Row>

          {/* Chart and Activities */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <div className="flex justify-between items-center">
                    <Text strong className="text-lg">Revenue Overview</Text>
                    <Select defaultValue="yearly" className="w-32">
                      <Select.Option value="yearly">Yearly</Select.Option>
                      <Select.Option value="monthly">Monthly</Select.Option>
                      <Select.Option value="weekly">Weekly</Select.Option>
                    </Select>
                  </div>
                }
                className="rounded-xl shadow-sm"
                bordered={false}
              >
                <div className="h-[400px]">
                  <DashboardChart />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"/>
                    <Text strong className="text-lg">Recent Activities</Text>
                  </div>
                }
                className="rounded-xl shadow-sm"
                bordered={false}
              >
                <Table 
                  columns={columns} 
                  dataSource={recentActivities}
                  pagination={false}
                  size="middle"
                  className="[-webkit-transform:translate3d(0,0,0)]"
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;