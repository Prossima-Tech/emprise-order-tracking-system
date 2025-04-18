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
import '../../dashboard.css';

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
    <Card className="stats-card elevation-2 shadow-md">
      <CardHeader>
        <CardTitle>Procurement Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="offers"
                className="procurement-chart-offers"
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                className="procurement-chart-orders"
                dot={{ fill: "hsl(142 76% 36%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}