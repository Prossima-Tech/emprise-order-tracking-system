import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { StatisticsCard } from './StatisticsCard';
import { RecentActivity } from './RecentActivity';
import { ProcurementTrends } from './charts/ProcurementTrends';
// import { BudgetaryOfferStatus } from './charts/BudgetaryOfferStatus';
import { EMDMaturityChart } from './charts/EMDMaturityChart';
// import { MetricsOverview } from './widgets/MetricsOverview';
import { QuickActions } from './widgets/QuickActions';
// import { Notifications } from './widgets/Notifications';
import { FileText, ShoppingCart, Wallet, AlertTriangle } from 'lucide-react';
import { DashboardStats, Activity, TrendData } from '../types/dashboard';

interface DashboardLayoutProps {
  loading: boolean;
  error: string | null;
  stats: DashboardStats | null;
  activities: Activity[];
  trends: TrendData[];
}

export function DashboardLayout({ 
  loading, 
  error, 
  stats, 
  activities, 
  trends 
}: DashboardLayoutProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No dashboard data available</AlertDescription>
      </Alert>
    );
  }


  const statisticsCards = [
    {
      title: "Total Offers",
      value: stats.totalOffers,
      description: "Total budgetary offers this month",
      trend: { 
        value: stats.offersTrend, 
        direction: stats.offersTrend >= 0 ? 'up' : 'down' 
      },
      icon: FileText
    },
    {
      title: "Active EMDs",
      value: stats.activeEmds,
      description: `Total value: ₹${(stats.activeEmdsValue || 0).toLocaleString()}`,
      icon: Wallet
    },
    {
      title: "Purchase Orders",
      value: stats.totalOrders,
      description: "Purchase orders this month",
      trend: { 
        value: stats.ordersTrend, 
        direction: stats.ordersTrend >= 0 ? 'up' : 'down' 
      },
      icon: ShoppingCart
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statisticsCards.map((card, index) => (
          <StatisticsCard 
            key={index}
            title={card.title}
            value={card.value}
            description={card.description}
            trend={card.trend as { value: number; direction: "up" | "down" } | undefined}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="col-span-full lg:col-span-2 space-y-4 ">
          <QuickActions />
          {/* <Notifications /> */}
          {/* <MetricsOverview data={stats.metrics} /> */}
            <EMDMaturityChart data={[{
              month: 'Total EMD Value',
              value: stats.activeEmdsValue
            }]} />

        </div>
        <div className="col-span-full lg:col-span-4 space-y-4">
          <ProcurementTrends data={trends} />
          {/* <div className="grid gap-4 md:grid-cols-2">
            <BudgetaryOfferStatus data={stats.offerStatus} />
          </div> */}
        </div>
        {/* Sidebar Section - Spans 2 columns on large screens */}
      </div>

      {/* Recent Activity Section */}
      <RecentActivity activities={activities} />
    </div>
  );
}