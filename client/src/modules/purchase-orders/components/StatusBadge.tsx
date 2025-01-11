import React from 'react';
import { Tag } from 'antd';
import { POStatus } from '../../../types/purchase-order';    

interface StatusBadgeProps {
  status: POStatus | string;
  className?: string;
}

/**
 * Status configuration mapping that defines the visual appearance for each PO status.
 * Colors are chosen to reflect the logical progression of a purchase order:
 * - DRAFT: Grey (default) for initial state
 * - ISSUED: Blue (processing) for sent to vendor
 * - IN_PROGRESS: Orange (warning) for active processing
 * - COMPLETED: Green (success) for successful completion
 * - CANCELLED: Red (error) for terminated orders
 */
const statusConfig: Record<POStatus, { color: string; label: string }> = {
  [POStatus.DRAFT]: {
    color: 'default',
    label: 'Draft'
  },
  [POStatus.ISSUED]: {
    color: 'processing',
    label: 'Issued'
  },
  [POStatus.IN_PROGRESS]: {
    color: 'warning',
    label: 'In Progress'
  },
  [POStatus.COMPLETED]: {
    color: 'success',
    label: 'Completed'
  },
  [POStatus.CANCELLED]: {
    color: 'error',
    label: 'Cancelled'
  }
};

/**
 * StatusBadge Component for Purchase Orders
 * 
 * Displays the current status of a purchase order using color-coded badges.
 * The component handles both enum POStatus values and string status values,
 * providing consistent visual feedback about the order's current state.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  // Handle both POStatus enum and string status values
  const statusKey = status as POStatus;
  const config = statusConfig[statusKey] || {
    color: 'default',
    label: status.toString().replace(/_/g, ' ').toLowerCase()
  };

  return (
    <Tag
      color={config.color}
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${className || ''}`}
    >
      {config.label}
    </Tag>
  );
};

export default StatusBadge;