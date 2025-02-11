import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";

interface Metric {
  label: string;
  value: number;
  total: number;
  color: string;
}

interface MetricsOverviewProps {
  data: Metric[];
}

export function MetricsOverview({ data }: MetricsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Metrics Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{metric.label}</span>
              <span className="font-medium">
                {metric.value}/{metric.total}
              </span>
            </div>
            <Progress
              value={(metric.value / metric.total) * 100}
              className={`h-2 bg-${metric.color}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}