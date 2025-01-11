import React from 'react';
import { message, Typography } from 'antd';
import { BOForm } from '../components/BOForm';
import { boService } from '../services/boServices';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

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
    <div className="p-3">
      <div className="mb-6">
        <Title level={4} className="!mb-1">Create Budgetary Offer</Title>
        <Text type="secondary">Create a new budgetary offer by filling in the required information</Text>
      </div>
      
      <BOForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateBO;