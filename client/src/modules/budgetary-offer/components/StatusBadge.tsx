import React from 'react';
import { Tag } from 'antd';
import { BudgetaryOfferStatus } from '@emprise/shared/src/types/budgetary-offer';

const statusColors = {
  [BudgetaryOfferStatus.DRAFT]: 'default',
  [BudgetaryOfferStatus.SUBMITTED]: 'processing',
  [BudgetaryOfferStatus.APPROVED]: 'success',
  [BudgetaryOfferStatus.REJECTED]: 'error',
};

interface StatusBadgeProps {
  status: BudgetaryOfferStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Tag color={statusColors[status]}>
      {status}
    </Tag>
  );
};

export default StatusBadge;