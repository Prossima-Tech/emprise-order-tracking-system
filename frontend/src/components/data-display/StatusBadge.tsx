import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: string;
}

const statusColors = {
  DRAFT: 'bg-gray-500',
  PENDING_APPROVAL: 'bg-yellow-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  RELEASED: 'bg-green-500',
  RETURNED: 'bg-red-500',
  ACTIVE: 'bg-green-500',
  CLOSED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
  AWARDED: 'bg-blue-500',
} as const;

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const color = statusColors[status as keyof typeof statusColors] || 'bg-gray-400';
  
  return (
    <Badge className={color}>
      {status}
    </Badge>
  );
};