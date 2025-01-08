import { Card, Button, Space, message, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { StatusBadge } from '../components/StatusBadge';
import { boService } from '../services/boServices';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { BODetails } from '../components/BODetails';

export const ViewBO: React.FC = () => {
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const data = await boService.getOffer(id!);
        setOffer(data);
      } catch (error) {
        message.error('Failed to fetch offer details');
        navigate('/budgetary-offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id, navigate]);

  if (loading || !offer) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>Budgetary Offer Details</span>
            <Space>
              <StatusBadge status={offer.status} />
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/budgetary-offers/edit/${id}`)}
                disabled={offer.status !== 'DRAFT'}
              >
                Edit
              </Button>
            </Space>
          </div>
        }
      >
        <BODetails offer={offer} />
      </Card>
    </div>
  );
};

export default ViewBO;