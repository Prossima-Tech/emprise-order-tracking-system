// src/modules/purchase-orders/pages/PurchaseOrderDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Result, Card, Typography, Space, message } from 'antd';
import { 
  ArrowLeftOutlined, 
  ShoppingCartOutlined,
  PrinterOutlined,
  EditOutlined
} from '@ant-design/icons';
import { mockPurchaseOrderApi } from '../services/mockApi';
import { POStatus, PurchaseOrder } from '../../../types/purchase-order';
import { PageLoading } from '../../../components/shared/PageLoading';
import { PurchaseOrderDetails } from '../components/PurchaseOrderDetails';

const { Title, Text } = Typography;

export const PurchaseOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [po, setPO] = useState<PurchaseOrder | null>(null);

  const fetchPODetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await mockPurchaseOrderApi.getPODetails(id);
      setPO(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load purchase order'));
      message.error('Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPODetails();
  }, [id]);

  const handleStatusUpdate = async (status: POStatus) => {
    try {
      if (!id) return;
      
      await mockPurchaseOrderApi.updateStatus(id, status);
      message.success('Status updated successfully');
      fetchPODetails(); // Refresh the data
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handlePrint = () => {
    message.info('Printing functionality will be implemented soon');
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Error Loading Purchase Order"
        subTitle={error.message}
        extra={[
          <Button 
            key="back" 
            onClick={() => navigate('/purchase-orders')}
            icon={<ArrowLeftOutlined />}
          >
            Back to List
          </Button>
        ]}
      />
    );
  }

  if (!po) {
    return (
      <Result
        status="404"
        title="Purchase Order Not Found"
        subTitle="The purchase order you're looking for doesn't exist."
        extra={[
          <Button 
            key="back" 
            onClick={() => navigate('/purchase-orders')}
            icon={<ArrowLeftOutlined />}
          >
            Back to List
          </Button>
        ]}
      />
    );
  }

  return (
    <div className="p-3 mx-auto">
      {/* Header Card */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingCartOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
            <div>
              <Title level={4} className="!mb-1">Purchase Order Details</Title>
              <Text type="secondary">{po.poNumber}</Text>
            </div>
          </div>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/purchase-orders')}
            >
              Back to List
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
            >
              Print
            </Button>
            {po.status === POStatus.DRAFT && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/purchase-orders/edit/${po.id}`)}
              >
                Edit
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Details Component */}
      <PurchaseOrderDetails
        po={po}
        loading={false}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default PurchaseOrderDetailsPage;