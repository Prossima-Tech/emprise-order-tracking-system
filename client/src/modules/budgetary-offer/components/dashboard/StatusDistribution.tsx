import React from 'react';
import { Card } from 'antd';

interface StatusDistributionProps {
  loading: boolean;
  statistics: any;
}

const StatusDistribution: React.FC<StatusDistributionProps> = ({ loading, statistics }) => {
  return (
    <Card title="Status Distribution" loading={loading}>
      <div className="space-y-4">
        {statistics?.byStatus && Object.entries(statistics.byStatus).map(([status, count]) => (
          <div key={status} className="flex items-center">
            <div className="w-32 font-medium">{status}</div>
            <div className="flex-1">
              <div className="bg-gray-200 h-4 rounded-full">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{
                    width: `${(count as number / statistics.totalOffers) * 100}%`
                  }}
                />
              </div>
            </div>
            <div className="w-16 text-right">{count as number}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatusDistribution;