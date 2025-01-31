import React from 'react';
import { Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendsChartProps {
  loading: boolean;
  data: any[];
}

const TrendsChart: React.FC<TrendsChartProps> = ({ loading, data }) => {
  return (
    <Card title="Monthly Trends" loading={loading}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data || []}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#1890ff"
              name="Number of Offers"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="value"
              stroke="#52c41a"
              name="Total Value"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TrendsChart;