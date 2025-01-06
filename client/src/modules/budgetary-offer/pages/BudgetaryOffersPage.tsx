// src/modules/budgetary-offer/pages/BudgetaryOffersPage.tsx
import { useState } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../components/shared/PageHeader';
import { BudgetaryOfferList } from '../components/BudgetaryOfferList';
import { CreateBudgetaryOfferModal } from '../components/CreateBudgetaryOfferModal';
import { useQuery } from '../../../hooks/useQuery';
import { budgetaryOfferService } from '../services';
import { BudgetaryOffer } from '@emprise/shared/src/types/budgetary-offer';
import type { PaginatedResponse } from '@emprise/shared/src/types/common';

export const BudgetaryOffersPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const { 
    data, 
    loading, 
    refetch 
  } = useQuery<PaginatedResponse<BudgetaryOffer>>({
    queryFn: () => budgetaryOfferService.getAll(filters),
  });

  const handleView = (offer: BudgetaryOffer) => {
    // Implement view logic
  };

  const handleEdit = (offer: BudgetaryOffer) => {
    // Implement edit logic
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <PageHeader
          title="Budgetary Offers"
          subtitle="Manage and track all budgetary offers"
          extra={[
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Create New Offer
            </Button>,
          ]}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <BudgetaryOfferList
          offers={data?.items}
          loading={loading}
          onRefresh={refetch}
          onView={handleView}
          onEdit={handleEdit}
          onFilterChange={handleFilterChange}
        />
      </div>

      <CreateBudgetaryOfferModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
          message.success('Budgetary offer created successfully');
        }}
      />
    </div>
  );
};

export default BudgetaryOffersPage;