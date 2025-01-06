// src/modules/purchase-orders/pages/PurchaseOrdersPage.tsx
import { useState } from 'react';
import { Row, Col, Card, Statistic, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../components/shared/PageHeader';
import { PurchaseOrderList } from '../components/PurchaseOrderList';
import { CreatePOModal } from '../components/CreatePOModal';
import { useQuery } from '../../../hooks/useQuery';
import { mockPurchaseOrderApi as purchaseOrderApi } from '../services/mockApi';
import { toNumber } from '../../../utils/decimal';
import { POFilter } from '@emprise/shared/src/types/purchase-order';

export const PurchaseOrdersPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<POFilter>({});

  const { 
    data: poResponse, 
    loading, 
    refetch 
  } = useQuery({
    queryFn: () => purchaseOrderApi.listPOs(filters),
  });

  const { data: statistics, loading: statsLoading } = useQuery({
    queryFn: () => purchaseOrderApi.getStatistics(),
  });

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleFilterChange = (newFilters: POFilter) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage and track purchase orders"
        extra={[
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Purchase Order
          </Button>,
        ]}
      />

      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total POs"
              value={statistics?.totalCount || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total Value"
              value={toNumber(statistics?.totalValue)}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Pending Delivery"
              value={statistics?.pendingDelivery || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Completed"
              value={statistics?.completed || 0}
            />
          </Card>
        </Col>
      </Row>

      <PurchaseOrderList
        orders={poResponse?.items || []}
        loading={loading}
        total={poResponse?.total || 0}
        onRefresh={refetch}
        onFilterChange={handleFilterChange}
      />

      <CreatePOModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default PurchaseOrdersPage;