import { useState } from 'react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { EMDList } from '../components/EMDList';
import { EMDSubmissionModal } from '../components/EMDSubmissionModal';
import { useQuery } from '../../../hooks/useQuery';
import { emdApi } from '../services';
import { EMDTracking, EMDStatistics, EMDFilter } from '@emprise/shared/src/types/emd';
import { PaginatedResponse } from '@emprise/shared/src/types/common';

export const EMDTrackingPage = () => {
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [filter, setFilter] = useState<EMDFilter>({
    page: 1,
    limit: 10,
  });

  const { data: emdsResponse, loading: emdsLoading, refetch } = useQuery<PaginatedResponse<EMDTracking>>({
    queryFn: () => emdApi.getAll(filter),
    dependencies: [filter],
  });

  const { data: statistics, loading: statsLoading } = useQuery<EMDStatistics>({
    queryFn: emdApi.getStatistics,
  });

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter(prev => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  };

  return (
    <div className="p-6">
      <PageHeader
        title="EMD Tracking"
        subtitle="Track and manage Earnest Money Deposits"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className={`${statsLoading ? 'animate-pulse' : ''}`}>
            <h3 className="text-sm text-gray-500 font-medium">Total EMDs</h3>
            <p className="text-2xl font-semibold mt-2">{statistics?.total || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className={`${statsLoading ? 'animate-pulse' : ''}`}>
            <h3 className="text-sm text-gray-500 font-medium">Total Amount</h3>
            <p className="text-2xl font-semibold mt-2">
              ₹{Number(statistics?.totalAmount || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className={`${statsLoading ? 'animate-pulse' : ''}`}>
            <h3 className="text-sm text-gray-500 font-medium">Overdue EMDs</h3>
            <p className="text-2xl font-semibold mt-2 text-red-500">
              {statistics?.overdueCount || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className={`${statsLoading ? 'animate-pulse' : ''}`}>
            <h3 className="text-sm text-gray-500 font-medium">Returned Amount</h3>
            <p className="text-2xl font-semibold mt-2">
              ₹{Number(statistics?.returnedAmount || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <EMDList 
        emds={emdsResponse?.items || []}
        loading={emdsLoading}
        onRefresh={refetch}
        pagination={{
          current: filter.page || 1,
          pageSize: filter.limit || 10,
          total: emdsResponse?.total || 0,
          onChange: handlePageChange,
        }}
      />

      <EMDSubmissionModal
        open={isSubmissionModalOpen}
        onCancel={() => setIsSubmissionModalOpen(false)}
        onSuccess={() => {
          setIsSubmissionModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default EMDTrackingPage;