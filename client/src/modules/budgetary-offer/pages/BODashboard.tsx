import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Space, Select, Button, Typography } from 'antd';
import { 
  DollarCircleOutlined, 
  FileTextOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  CalendarOutlined
} from '@ant-design/icons';
// import { BOList } from './BOList';
import { boService } from '../services/boServices';
import { BOTrendChart } from '../components/BOTrendChart';

const { Title, Text } = Typography;

// Enhance the statistics card design
const StatCard: React.FC<{
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  icon: React.ReactNode;
  loading: boolean;
  color: string;
}> = ({ title, value, prefix, suffix, trend, icon, loading, color }) => (
  <Card 
    loading={loading}
    bordered={false}
    className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
  >
    <div className="flex items-start justify-between">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <span className={`text-2xl ${color.replace('bg-', 'text-')}`}>{icon}</span>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-sm rounded-full px-2 py-1 ${
          trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span className="ml-1">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    
    <div className="mt-4">
      <Text className="text-gray-600 text-sm">{title}</Text>
      <div className="text-2xl font-semibold mt-1">
        {prefix}{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}{suffix}
      </div>
    </div>
  </Card>
);

export const BODashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'yearly' | 'monthly' | 'weekly'>('yearly');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await boService.getStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="space-y-6 p-3">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-1">Budgetary Offers Overview</Title>
          <Text type="secondary">Monitor and analyze your budgetary offers performance</Text>
        </div>
        <Space>
          <Select
            defaultValue={timeRange}
            onChange={setTimeRange}
            className="w-32"
            options={[
              { label: 'Yearly', value: 'yearly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Weekly', value: 'weekly' }
            ]}
          />
          <Button type="primary" icon={<CalendarOutlined />}>
            Export Report
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Offers"
            value={statistics?.total || 0}
            icon={<FileTextOutlined />}
            loading={loading}
            trend={12}
            color="bg-blue-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Value"
            value={statistics?.totalValue || 0}
            prefix="₹"
            icon={<DollarCircleOutlined />}
            loading={loading}
            trend={8.5}
            color="bg-green-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total EMD Value"
            value={statistics?.totalEMDValue || 0}
            prefix="₹"
            icon={<DollarCircleOutlined />}
            loading={loading}
            trend={-3.2}
            color="bg-purple-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Average EMD %"
            value={statistics?.averageEMDPercentage || 0}
            suffix="%"
            icon={<FileTextOutlined />}
            loading={loading}
            trend={2.1}
            color="bg-amber-500"
          />
        </Col>
      </Row>

      {/* Trend Chart */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <div className="w-1 h-6 bg-blue-500 rounded-full"/>
                <span className="font-medium">Offers Trend Analysis</span>
              </Space>
            }
            className="rounded-xl shadow-sm"
            bordered={false}
          >
            <div className="h-[400px]">
              <BOTrendChart timeRange={timeRange} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Offers List
      <div className="bg-gray-50 rounded-xl p-6">
        <Title level={5} className="!mb-6">Recent Budgetary Offers</Title>
        <BOList />
      </div> */}
    </div>
  );
};

export default BODashboard;