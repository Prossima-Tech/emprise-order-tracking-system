import { Card, Row, Col, Statistic, Table } from 'antd';
import { BOList } from '../components/BOList';
import { boService } from '../services/boServices';
import React, { useEffect, useState } from 'react';

export const BODashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="p-6">
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Offers"
              value={statistics?.total || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Value"
              value={statistics?.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 0}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Total EMD Value"
              value={statistics?.totalEMDValue.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 0}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Average EMD %"
              value={statistics?.averageEMDPercentage || 0}
              precision={2}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <BOList />
    </div>
  );
};

export default BODashboard;