// src/modules/purchase-orders/pages/EditPOPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { POForm } from '../components/POForm';
import { purchaseOrderApi } from '../services/api';
import type { POCreateInput, PurchaseOrder } from '@emprise/shared/src/types/purchase-order';

const { Title, Text } = Typography;

export const EditPOPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<POCreateInput>>();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchPO = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const po = await purchaseOrderApi.getPODetails(id);
        setInitialValues({
          vendorId: po.vendorId,
          loaId: po.loaId,
          deliveryDate: po.deliveryDate,
          items: po.items?.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            specifications: item.specifications
          }))
        });
      } catch (error) {
        message.error('Failed to load purchase order');
        navigate('/purchase-orders');
      } finally {
        setLoading(false);
      }
    };

    fetchPO();
  }, [id, navigate]);

  const handleSubmit = async (values: POCreateInput) => {
    if (!id) return;

    try {
      setLoading(true);
      await purchaseOrderApi.updatePO(id, values);
      message.success('Purchase order updated successfully');
      navigate('/purchase-orders');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to update purchase order');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6  mx-auto">
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingCartOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
            <div>
              <Title level={4} className="!mb-1">Edit Purchase Order</Title>
              <Text type="secondary">Update the purchase order details below</Text>
            </div>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/purchase-orders')}
          >
            Back to List
          </Button>
        </div>
      </Card>

      {/* Show POForm only when initial values are loaded */}
      {initialValues && (
        <POForm 
          onSubmit={handleSubmit} 
          loading={loading}
          initialValues={initialValues}
        />
      )}
    </div>
  );
};

export default EditPOPage;