import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";
import { Bell, AlertTriangle, Info, XCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import apiClient from "../../../../lib/utils/api-client";
import { useToast } from "../../../../hooks/use-toast-app";

interface Notification {
  id: string;
  type: "warning" | "info" | "error";
  title: string;
  description: string;
  timestamp: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/dashboard/notifications');
        setNotifications(response.data);
      } catch (error) {
        showError('Failed to fetch notifications');
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Clock className="h-4 w-4 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            No new notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <Alert
              key={notification.id}
              variant={notification.type === "warning" ? "destructive" : "default"}
              className="relative"
            >
              {getNotificationIcon(notification.type)}
              <AlertTitle>{notification.title}</AlertTitle>
              <AlertDescription>
                {notification.description}
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </div>
              </AlertDescription>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
}