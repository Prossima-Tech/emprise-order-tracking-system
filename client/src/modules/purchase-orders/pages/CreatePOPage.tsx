// src/modules/purchase-orders/pages/CreatePOPage.tsx
import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Typography, 
  message,
  Space,
  Row,
  Col,
  // Statistic 
} from 'antd';
import { 
  ShoppingCartOutlined, 
  ArrowLeftOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { POForm } from '../components/POForm';
import { purchaseOrderApi } from '../services/api';
import type { POCreateInput } from '@emprise/shared/src/types/purchase-order';

const { Title, Text } = Typography;

export const CreatePOPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: POCreateInput) => {
    try {
      setLoading(true);
      await purchaseOrderApi.createPO(values);
      message.success('Purchase order created successfully');
      navigate('/purchase-orders');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to create purchase order');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} className="!mb-1">Create Purchase Order</Title>
          <Text type="secondary">Create a new purchase order by filling in the required information</Text>
        </div>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/purchase-orders')}
          >
            Back to List
          </Button>
        </Space>
      </div>

      {/* Quick Info Cards */}
      {/* <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <FileTextOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
              <div>
                <Text type="secondary">Important Note</Text>
                <div className="text-base mt-1">Fill all required fields marked with (*)</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <DollarCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-green-50 text-green-500" />
              <div>
                <Text type="secondary">Pricing</Text>
                <div className="text-base mt-1">Total value will be calculated automatically</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-orange-50 text-orange-500" />
              <div>
                <Text type="secondary">Status</Text>
                <div className="text-base mt-1">Order will be created in Draft status</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row> */}

      {/* Form Section */}
      <Card>
        <div className="flex items-center mb-6">
          <ShoppingCartOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
          <div>
            <Title level={5} className="!mb-1">Order Details</Title>
            <Text type="secondary">Enter the purchase order information below</Text>
          </div>
        </div>
        <POForm onSubmit={handleSubmit} loading={loading} />
      </Card>
    </div>
  );
};

export default CreatePOPage;