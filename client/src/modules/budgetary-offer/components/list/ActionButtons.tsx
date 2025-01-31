import React from 'react';
import { Button, Space, message } from 'antd';
import { FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BOService } from '../../services/BOService';

interface ActionButtonsProps {
  record: any;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ record }) => {
  const navigate = useNavigate();

  const handleDownloadPDF = async () => {
    try {
      const blob = await BOService.downloadPDF(record.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BO-${record.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to download PDF');
    }
  };

  return (
    <Space>
      <Button 
        type="link" 
        icon={<FileTextOutlined />}
        onClick={() => navigate(`/budgetary-offers/${record.id}`)}
      >
        View
      </Button>
      <Button
        type="link"
        icon={<DownloadOutlined />}
        onClick={handleDownloadPDF}
      >
        PDF
      </Button>
    </Space>
  );
};

export default ActionButtons;