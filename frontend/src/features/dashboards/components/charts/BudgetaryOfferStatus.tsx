import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OfferStatusData {
  name: string;
  value: number;
  color: string;
}

interface BudgetaryOfferStatusProps {
  data: OfferStatusData[];
}

export function BudgetaryOfferStatus({ data }: BudgetaryOfferStatusProps) {
  const COLORS = {
    DRAFT: "#94A3B8",
    PENDING_APPROVAL: "#F59E0B",
    APPROVED: "#10B981", 
    REJECTED: "#EF4444"
  };

  // const total = data.reduce((sum: number, item: OfferStatusData) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}