import React from 'react';
import { Card, message } from 'antd';
import { BOForm } from '../components/BOForm';
import { boService } from '../services/boServices';
import { useNavigate } from 'react-router-dom';

export const CreateBO: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await boService.createOffer(values);
      message.success('Budgetary offer created successfully');
      navigate('/budgetary-offers');
    } catch (error: any) {
      message.error(error.message || 'Failed to create budgetary offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card title="Create Budgetary Offer">
        <BOForm onSubmit={handleSubmit} loading={loading} />
      </Card>
    </div>
  );
};



export default CreateBO;