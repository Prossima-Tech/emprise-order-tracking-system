import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendData {
  month: string;
  offers: number;
  orders: number;
}

interface ProcurementTrendsProps {
  data: TrendData[];
}

export function ProcurementTrends({ data }: ProcurementTrendsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Procurement Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="offers"
                stroke="#8884d8"
                name="Offers"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#82ca9d"
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}