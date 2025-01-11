import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface BOTrendChartProps {
  timeRange: 'yearly' | 'monthly' | 'weekly';
}

export const BOTrendChart: React.FC<BOTrendChartProps> = ({ timeRange }) => {
  // Sample data - replace with real data from your API
  const data = [
    { period: 'Jan', totalValue: 450000, totalOffers: 24, avgEMD: 15 },
    { period: 'Feb', totalValue: 380000, totalOffers: 18, avgEMD: 12 },
    { period: 'Mar', totalValue: 520000, totalOffers: 30, avgEMD: 18 },
    { period: 'Apr', totalValue: 278000, totalOffers: 20, avgEMD: 14 },
    { period: 'May', totalValue: 189000, totalOffers: 15, avgEMD: 10 },
    { period: 'Jun', totalValue: 239000, totalOffers: 22, avgEMD: 15 },
    { period: 'Jul', totalValue: 349000, totalOffers: 28, avgEMD: 16 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={index} 
              className="text-sm"
              style={{ color: entry.color }}
            >
              <span className="font-medium">{entry.name}: </span>
              {entry.name === 'Total Value' 
                ? `₹${entry.value.toLocaleString()}` 
                : entry.name === 'Avg EMD'
                  ? `${entry.value}%`
                  : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="totalValueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="totalOffersGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="avgEMDGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
          </linearGradient>
        </defs>

        <CartesianGrid 
          strokeDasharray="3 3" 
          className="stroke-gray-200"
          vertical={false}
        />

        <XAxis
          dataKey="period"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={{ stroke: '#E5E7EB' }}
          axisLine={{ stroke: '#E5E7EB' }}
        />

        <YAxis
          yAxisId="left"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={{ stroke: '#E5E7EB' }}
          axisLine={{ stroke: '#E5E7EB' }}
          tickFormatter={(value) => `₹${value/1000}k`}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={{ stroke: '#E5E7EB' }}
          axisLine={{ stroke: '#E5E7EB' }}
        />

        <Tooltip content={<CustomTooltip />} />
        
        <Legend 
          verticalAlign="top" 
          height={36}
          iconType="circle"
          iconSize={8}
        />

        <Area
          yAxisId="left"
          type="monotone"
          dataKey="totalValue"
          name="Total Value"
          stroke="#3B82F6"
          fill="url(#totalValueGradient)"
          strokeWidth={2}
          dot={{ strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />

        <Area
          yAxisId="right"
          type="monotone"
          dataKey="totalOffers"
          name="Total Offers"
          stroke="#10B981"
          fill="url(#totalOffersGradient)"
          strokeWidth={2}
          dot={{ strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />

        <Area
          yAxisId="right"
          type="monotone"
          dataKey="avgEMD"
          name="Avg EMD"
          stroke="#8B5CF6"
          fill="url(#avgEMDGradient)"
          strokeWidth={2}
          dot={{ strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default BOTrendChart;