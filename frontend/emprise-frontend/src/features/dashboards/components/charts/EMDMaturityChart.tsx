import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

interface EMDValueData {
  month: string;
  value: number;
}

interface EMDValueChartProps {
  data: EMDValueData[];
}

export function EMDMaturityChart({ data }: EMDValueChartProps) {
  const latestValue = data[data.length - 1]?.value || 0;
  // const previousValue = data[data.length - 2]?.value || 0;
  // const percentageChange = previousValue ? ((latestValue - previousValue) / previousValue) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="py-2">
      <CardHeader>
        <CardTitle>EMD Value Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div>
            <p className="text-3xl font-bold">{formatCurrency(latestValue)}</p>
            <p className="text-sm text-muted-foreground">Current EMD Value</p>
          </div>
          
          {/* <div className="flex items-center">
            <span className={`text-sm ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentageChange >= 0 ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground ml-2">vs previous month</span>
          </div>

          <div className="space-y-2">
            {data.slice(-3).reverse().map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.month}</span>
                <span>{formatCurrency(item.value ?? 0)}</span>
              </div>
            ))}
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
