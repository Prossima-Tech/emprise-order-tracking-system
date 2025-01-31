import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import type { StatisticCard } from "../types/dashboard";

export function StatisticsCard({ title, value, description, trend, icon: Icon }: StatisticCard) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          {trend && (
            <span
              className={`flex items-center text-sm ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.direction === 'up' ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
              {trend.value}%
            </span>
          )}
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}