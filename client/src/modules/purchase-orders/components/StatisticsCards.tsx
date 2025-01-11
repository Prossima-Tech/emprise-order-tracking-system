// src/modules/purchase-orders/components/StatisticsCards.tsx
import { Row, Col, Card, Statistic } from 'antd';
import { POStatistics } from '../../../types/purchase-order';
// import { formatCurrency } from '../../../utils/format';

interface StatisticsCardsProps {
  statistics: POStatistics;
  loading: boolean;
}

export const StatisticsCards = ({ statistics, loading }: StatisticsCardsProps) => {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading} className="h-full">
          <Statistic
            title="Total POs"
            value={statistics.totalCount}
            className="text-blue-600"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading} className="h-full">
          <Statistic
            title="Total Value"
            value={Number(statistics.totalValue)}
            precision={2}
            prefix="₹"
            className="text-green-600"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading} className="h-full">
          <Statistic
            title="Pending Delivery"
            value={statistics.pendingDelivery}
            className="text-orange-600"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading} className="h-full">
          <Statistic
            title="Completed"
            value={statistics.completed}
            className="text-green-600"
          />
        </Card>
      </Col>
    </Row>
  );
};