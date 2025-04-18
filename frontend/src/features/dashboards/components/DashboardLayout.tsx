import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { StatisticsCard } from './StatisticsCard';
import { RecentActivity } from './RecentActivity';
import { ProcurementTrends } from './charts/ProcurementTrends';
import { QuickActions } from './widgets/QuickActions';
import { FileText, ShoppingCart, AlertTriangle } from 'lucide-react';
import { DashboardStats, Activity, TrendData } from '../types/dashboard';
import { motion } from 'framer-motion';
import '../dashboard.css';

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert className="animate-in fade-in slide-in-from-top-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No dashboard data available</AlertDescription>
      </Alert>
    );
  }

  const statisticsCards = [
    {
      title: "Budgetary Offers",
      value: stats.totalOffers,
      description: "Total budgetary offers this month",
      trend: { 
        value: stats.offersTrend, 
        direction: stats.offersTrend >= 0 ? 'up' : 'down' 
      },
      icon: FileText,
      color: "blue"
    },
    {
      title: "Purchase Orders",
      value: stats.totalOrders,
      description: "Purchase orders this month",
      trend: { 
        value: stats.ordersTrend, 
        direction: stats.ordersTrend >= 0 ? 'up' : 'down' 
      },
      icon: ShoppingCart,
      color: "violet"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Statistics Cards */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {statisticsCards.map((card, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <StatisticsCard 
              {...card}
              trend={card.trend as { value: number; direction: "up" | "down" } | undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        <motion.div 
          className="col-span-full lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickActions />
        </motion.div>

        <motion.div 
          className="col-span-full lg:col-span-4 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProcurementTrends data={trends} />
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <RecentActivity activities={activities} />
      </motion.div>
    </motion.div>
  );
}