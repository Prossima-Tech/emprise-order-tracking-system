import React from 'react';
import { Card, message, Spin } from 'antd';
import { BOForm } from '../components/BOForm';
import { boService } from '../services/boServices';
import { useNavigate, useParams } from 'react-router-dom';

export const EditBO: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [offer, setOffer] = React.useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  React.useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
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

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await boService.updateOffer(id!, values);
      message.success('Budgetary offer updated successfully');
      navigate('/budgetary-offers');
    } catch (error: any) {
      message.error(error.message || 'Failed to update budgetary offer');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !offer) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card title="Edit Budgetary Offer">
        <BOForm
          initialValues={offer}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default EditBO;