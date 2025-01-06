// src/modules/master-data/components/StatCard.tsx
import React from 'react';
import { Card, Statistic } from 'antd';

interface StatCardProps {
  title: string;
  value: number;
  prefix: React.ReactNode;
  color: string;
  subValue?: { label: string; value: number };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  color,
  subValue,
}) => (
  <Card>
    <Statistic
      title={title}
      value={value}
      prefix={prefix}
      valueStyle={{ color }}
    />
    {subValue && (
      <div className="text-sm text-gray-500 mt-2">
        {subValue.label}: {subValue.value}
      </div>
    )}
  </Card>
);