// src/modules/dashboard/pages/DashboardPage.tsx
import { PageTransition } from '../../../components/shared/PageTransition';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DashboardChart } from '../components/DashboardChart';
import { RecentActivities } from '../components/RecentActivities';

export const DashboardPage = () => {
  // Hard-coded data
  const stats = {
    totalPurchaseOrders: 145000,
    activeLOAs: 24,
    pendingApprovals: 12,
    emdSubmissions: 8
  };

  return (
    <PageTransition>
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview of your business metrics"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Purchase Orders</h3>
            <p className="text-2xl font-semibold">₹{stats.totalPurchaseOrders.toLocaleString()}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-2">
            <h3 className="text-gray-500 text-sm font-medium">Active LOAs</h3>
            <p className="text-2xl font-semibold">{stats.activeLOAs}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-2">
            <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
            <p className="text-2xl font-semibold">{stats.pendingApprovals}</p>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-2">
            <h3 className="text-gray-500 text-sm font-medium">EMD Submissions</h3>
            <p className="text-2xl font-semibold">{stats.emdSubmissions}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
            <div className="h-[400px]">
              <DashboardChart />
            </div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
            <RecentActivities />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;