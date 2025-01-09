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
  // Enhanced dataset with more detailed metrics
  const data = [
    { month: 'Jan', revenue: 4000, orders: 24, conversion: 68 },
    { month: 'Feb', revenue: 3000, orders: 18, conversion: 65 },
    { month: 'Mar', revenue: 5000, orders: 30, conversion: 72 },
    { month: 'Apr', revenue: 2780, orders: 20, conversion: 58 },
    { month: 'May', revenue: 1890, orders: 15, conversion: 55 },
    { month: 'Jun', revenue: 2390, orders: 22, conversion: 62 },
    { month: 'Jul', revenue: 3490, orders: 28, conversion: 70 },
  ];

  // Custom tooltip to display all metrics elegantly
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}: </span>
              {entry.name === 'Revenue' ? `₹${entry.value.toLocaleString()}` :
               entry.name === 'Conversion' ? `${entry.value}%` :
               entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            {/* Gradient definitions for more sophisticated fills */}
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
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
            dataKey="month"
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
            tickFormatter={(value) => `${value}%`}
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
            dataKey="revenue"
            stroke="#3B82F6"
            fill="url(#revenueGradient)"
            strokeWidth={2}
            name="Revenue"
            dot={{ strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="orders"
            stroke="#10B981"
            fill="url(#ordersGradient)"
            strokeWidth={2}
            name="Orders"
            dot={{ strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />

          <Area
            yAxisId="right"
            type="monotone"
            dataKey="conversion"
            stroke="#8B5CF6"
            fill="url(#conversionGradient)"
            strokeWidth={2}
            name="Conversion"
            dot={{ strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;