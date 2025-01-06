// src/modules/dashboard/components/DashboardChart.tsx
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

export const DashboardChart = () => {
  // Hard-coded data for the chart
  const data = [
    {
      month: 'Jan',
      revenue: 4000,
      orders: 24,
    },
    {
      month: 'Feb',
      revenue: 3000,
      orders: 18,
    },
    {
      month: 'Mar',
      revenue: 5000,
      orders: 30,
    },
    {
      month: 'Apr',
      revenue: 2780,
      orders: 20,
    },
    {
      month: 'May',
      revenue: 1890,
      orders: 15,
    },
    {
      month: 'Jun',
      revenue: 2390,
      orders: 22,
    },
    {
      month: 'Jul',
      revenue: 3490,
      orders: 28,
    },
  ];

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis 
            dataKey="month"
            tick={{ fill: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
          />
          <YAxis 
            tick={{ fill: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
            tickFormatter={(value) => `₹${value/1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number, name: string) => [
              name === 'revenue' ? `₹${value.toLocaleString()}` : value,
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            fill="#93C5FD"
            strokeWidth={2}
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#10B981"
            fill="#6EE7B7"
            strokeWidth={2}
            name="Orders"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;