// src/modules/master-data/pages/MasterDataDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spin, Select, Table, message } from 'antd';
import {
  ShoppingOutlined,
  TeamOutlined,
  LinkOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';
import { DashboardStats, MatchingData, TrendDataPoint } from '@emprise/shared/src/types/master';
import { dummyStats, generateTrendData, generateMatchingData } from '../data/dummyData';

export const MasterDataDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [matchingData, setMatchingData] = useState<MatchingData[]>([]);
  const [selectedMatchType, setSelectedMatchType] = useState<string>('item-vendor');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);

  useEffect(() => {
    // Simulate API call delay
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
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
    // Simulate API call for matching data
    const fetchMatchingData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        setMatchingData(generateMatchingData(selectedMatchType));
      } catch (error) {
        message.error('Failed to fetch matching data');
      }
    };

    fetchMatchingData();
  }, [selectedMatchType]);

  const matchingColumns = {
    'item-vendor': [
      { 
        title: 'Item Code', 
        dataIndex: 'itemCode', 
        key: 'itemCode',
        sorter: (a: any, b: any) => a.itemCode.localeCompare(b.itemCode),
      },
      { 
        title: 'Description', 
        dataIndex: 'itemDescription', 
        key: 'itemDescription',
      },
      { 
        title: 'Vendor', 
        dataIndex: 'vendorName', 
        key: 'vendorName',
        sorter: (a: any, b: any) => a.vendorName.localeCompare(b.vendorName),
      },
      { 
        title: 'Match Date', 
        dataIndex: 'matchDate', 
        key: 'matchDate',
        sorter: (a: any, b: any) => a.matchDate.localeCompare(b.matchDate),
      },
    ],
    'item-po': [
      { 
        title: 'Item Code', 
        dataIndex: 'itemCode', 
        key: 'itemCode',
        sorter: (a: any, b: any) => a.itemCode.localeCompare(b.itemCode),
      },
      { 
        title: 'Description', 
        dataIndex: 'itemDescription', 
        key: 'itemDescription',
      },
      { 
        title: 'PO Number', 
        dataIndex: 'poNumber', 
        key: 'poNumber',
        sorter: (a: any, b: any) => a.poNumber.localeCompare(b.poNumber),
      },
      { 
        title: 'Match Date', 
        dataIndex: 'matchDate', 
        key: 'matchDate',
        sorter: (a: any, b: any) => a.matchDate.localeCompare(b.matchDate),
      },
    ],
    'vendor-po': [
      { 
        title: 'Vendor', 
        dataIndex: 'vendorName', 
        key: 'vendorName',
        sorter: (a: any, b: any) => a.vendorName.localeCompare(b.vendorName),
      },
      { 
        title: 'PO Number', 
        dataIndex: 'poNumber', 
        key: 'poNumber',
        sorter: (a: any, b: any) => a.poNumber.localeCompare(b.poNumber),
      },
      { 
        title: 'Match Date', 
        dataIndex: 'matchDate', 
        key: 'matchDate',
        sorter: (a: any, b: any) => a.matchDate.localeCompare(b.matchDate),
      },
    ],
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Master Data Analytics</h1>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-lg font-medium text-gray-600 mb-2">Total Items</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">{stats.totalItems}</div>
              <ShoppingOutlined className="text-2xl text-blue-500" />
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Active: {stats.activeItems}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-lg font-medium text-gray-600 mb-2">Total Vendors</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">{stats.totalVendors}</div>
              <TeamOutlined className="text-2xl text-green-500" />
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Active: {stats.activeVendors}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-lg font-medium text-gray-600 mb-2">Item-Vendor Matches</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">{stats.itemVendorMatches}</div>
              <LinkOutlined className="text-2xl text-purple-500" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="text-lg font-medium text-gray-600 mb-2">PO Matches</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">
                {stats.itemPOMatches + stats.vendorPOMatches}
              </div>
              <ShoppingCartOutlined className="text-2xl text-orange-500" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Trend Chart */}
      {/* <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Matching Trends</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                name="Item-Vendor Matches"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Item-PO Matches"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
                stackId="2"
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Vendor-PO Matches"
                stroke="#ffc658"
                fill="#ffc658"
                fillOpacity={0.3}
                stackId="3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card> */}

      {/* Matching Data Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Matching Details</h2>
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
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default MasterDataDashboard;