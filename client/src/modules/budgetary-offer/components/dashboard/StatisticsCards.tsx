import React from 'react';

import { Card, Col, Row, Statistic } from 'antd';

import { InfoCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface StatisticsCardsProps {
  loading: boolean;
  statistics: any;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ loading, statistics }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Offers"
            value={statistics?.totalOffers || 0}
            prefix={<InfoCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Value"
            value={statistics?.totalValue || 0}
            precision={2}
            prefix="₹"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Pending Approvals"
            value={statistics?.approvalMetrics?.pendingApprovals || 0}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Approved Offers"
            value={statistics?.byStatus?.APPROVED || 0}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatisticsCards;