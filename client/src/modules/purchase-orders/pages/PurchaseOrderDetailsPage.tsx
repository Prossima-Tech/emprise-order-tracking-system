// src/modules/purchase-orders/pages/PurchaseOrderDetailsPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '../../../hooks/useQuery';
import { mockPurchaseOrderApi as purchaseOrderApi } from '../services/mockApi';
import { POStatus } from '@emprise/shared/src/types/purchase-order';
import { PageHeader } from '../../../components/shared/PageHeader';
import { PageLoading } from '../../../components/shared/PageLoading';
import { PurchaseOrderDetails } from '../components/PurchaseOrderDetails';

export const PurchaseOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { 
    data: po, 
    loading,
    error,
    refetch 
  } = useQuery({
    queryFn: () => purchaseOrderApi.getPODetails(id!),
    enabled: !!id,
  });

  const handleStatusUpdate = async (status: POStatus) => {
    if (id) {
      await purchaseOrderApi.updateStatus(id, status);
      refetch();
    }
  };

  const handleBack = () => {
    navigate('/purchase-orders');
  };

  // Show loading state
  if (loading) {
    return <PageLoading />;
  }

  // Show error state
  if (error) {
    return (
      <Result
        status="error"
        title="Error Loading Purchase Order"
        subTitle="There was a problem loading the purchase order details."
        extra={[
          <Button 
            key="back" 
            onClick={handleBack}
            icon={<ArrowLeftOutlined />}
          >
            Back to List
          </Button>
        ]}
      />
    );
  }

  // Show not found state
  if (!po) {
    return (
      <Result
        status="404"
        title="Purchase Order Not Found"
        subTitle="The purchase order you're looking for doesn't exist."
        extra={[
          <Button 
            key="back" 
            onClick={handleBack}
            icon={<ArrowLeftOutlined />}
          >
            Back to List
          </Button>
        ]}
      />
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Purchase Order Details"
        subtitle={po.poNumber}
        extra={[
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            Back to List
          </Button>
        ]}
      />

      <PurchaseOrderDetails
        po={po}
        loading={false} // We handle the main loading state above
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default PurchaseOrderDetailsPage;