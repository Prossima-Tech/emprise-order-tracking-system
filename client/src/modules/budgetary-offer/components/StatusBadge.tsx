import React from 'react';
import { Tag, Tooltip, Space } from 'antd';
import { 
  EditOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  FileDoneOutlined
} from '@ant-design/icons';
import { BudgetaryOfferStatus } from '../../../types/budgetary-offer';

// Enhanced status configuration with more metadata
const statusConfig = {
  [BudgetaryOfferStatus.DRAFT]: {
    color: '#8C8C8C',
    bgColor: '#F5F5F5',
    icon: <EditOutlined />,
    label: 'Draft',
    description: 'Offer is in draft state and can be edited'
  },
  [BudgetaryOfferStatus.SUBMITTED]: {
    color: '#1890FF',
    bgColor: '#E6F7FF',
    icon: <FileDoneOutlined />,
    label: 'Submitted',
    description: 'Offer has been submitted for review'
  },
  [BudgetaryOfferStatus.APPROVED]: {
    color: '#52C41A',
    bgColor: '#F6FFED',
    icon: <CheckCircleOutlined />,
    label: 'Approved',
    description: 'Offer has been approved'
  },
  [BudgetaryOfferStatus.REJECTED]: {
    color: '#FF4D4F',
    bgColor: '#FFF1F0',
    icon: <CloseCircleOutlined />,
    label: 'Rejected',
    description: 'Offer has been rejected'
  }
};

interface StatusBadgeProps {
  status: BudgetaryOfferStatus;
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showIcon = true, 
  showTooltip = true,
  className = ''
}) => {
  const config = statusConfig[status] || statusConfig[BudgetaryOfferStatus.DRAFT];

  const badge = (
    <Tag
      className={`px-3 py-1 rounded-full border-0 ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color
      }}
    >
      <Space size={4}>
        {showIcon && config.icon}
        <span>{config.label}</span>
      </Space>
    </Tag>
  );

  if (showTooltip) {
    return (
      <Tooltip title={config.description}>
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

// Timeline variant of the status badge
export const StatusTimelineBadge: React.FC<{ status: BudgetaryOfferStatus }> = ({ status }) => {
  const config = statusConfig[status];
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-2 h-2 rounded-full" 
        style={{ backgroundColor: config.color }}
      />
      <span className="text-sm" style={{ color: config.color }}>
        {config.label}
      </span>
    </div>
  );
};

export default StatusBadge;