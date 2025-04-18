import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Activity } from "../types/dashboard";
import { StatusBadge } from "../../../components/data-display/StatusBadge";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case 'offer':
        return activity.title.replace('undefined', '');
      case 'po':
        return activity.title;
      default:
        return activity.title;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{formatActivityTitle(activity)}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={activity.status} />
                <time className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </time>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
