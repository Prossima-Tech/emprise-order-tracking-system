// src/modules/master-data/components/StatusBadge.tsx
import React from 'react';
import { Tag } from 'antd';

interface StatusBadgeProps {
  status: boolean | string;
  type?: 'boolean' | 'status';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'boolean' }) => {
  if (type === 'boolean') {
    return (
      <Tag color={status ? 'success' : 'error'}>
        {status ? 'Active' : 'Inactive'}
      </Tag>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'BLACKLISTED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Tag color={getStatusColor(status as string)}>
      {status}
    </Tag>
  );
};