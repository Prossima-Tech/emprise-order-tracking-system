import { DashboardLayout } from '../components/DashboardLayout';
import { useDashboardData } from '../hooks/use-dashboard-data';

export function DashboardPage() {
  const { loading, error, stats, activities, trends } = useDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardLayout
        loading={loading}
        error={error}
        stats={stats ? { 
          ...stats, 
          metrics: [],
          activeEmdsValue: stats.activeEmdsValue 
        } : null}
        activities={activities}
        trends={trends}
      />
    </div>
  );
}