import React, { useState, useEffect } from 'react';
import { Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import { 
  FilterPanel,
  BOTable 
} from '../components/list';
import { BOService, BudgetaryOffer, BudgetaryOfferFilters, BudgetaryOfferStatus } from '../services/BOService';

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

interface Filters {
  status: undefined | string;
  dateRange: undefined | [Date | null, Date | null];
  search: string;
}

export const BOListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BudgetaryOffer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState<Filters>({
    status: undefined,
    dateRange: undefined,
    search: ''
  });

  const fetchOffers = async (
    page = pagination.current,
    pageSize = pagination.pageSize
  ) => {
    try {
      setLoading(true);
      const params: BudgetaryOfferFilters = {
        page,
        limit: pageSize,
        status: filters.status as BudgetaryOfferStatus,
        fromDate: filters.dateRange?.[0]?.toISOString(),
        toDate: filters.dateRange?.[1]?.toISOString(),
        search: filters.search || undefined
      };

      const response = await BOService.listOffers(params);
      
      // Check if response.data exists and has the expected structure
      if (response && response.data) {
        setData(response.data.offers || []);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.pagination?.total || 0
        });
      } else {
        // If the response structure is different, log it for debugging
        console.error('Unexpected response structure:', response);
        setData([]);
        setPagination({
          ...pagination,
          total: 0
        });
      }
    } catch (error) {
      message.error('Failed to fetch budgetary offers');
      console.error('Error fetching offers:', error);
      setData([]);
      setPagination({
        ...pagination,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [filters]);

  const handleTableChange = (newPagination: Pagination) => {
    fetchOffers(newPagination.current, newPagination.pageSize);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setPagination({ ...pagination, current: 1 }); // Reset to first page
    setFilters(newFilters);
  };

  return (
    <div className="p-6">
      <Card>
        <PageHeader
          title="Budgetary Offers"
          actions={[
            <Button
              key="create"
              type="primary"
              onClick={() => navigate('/budgetary-offers/create')}
              className="bg-blue-500"
            >
              Create New
            </Button>
          ]}
        />

        <div className="mb-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        <BOTable
          loading={loading}
          data={data}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default BOListPage;