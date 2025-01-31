import React, { useState, useEffect } from 'react';
import { Card, DatePicker } from 'antd';
import { PageHeader } from '../common/PageHeader';
import { 
  StatisticsCards,
  TrendsChart,
  StatusDistribution 
} from '../components/dashboard';
import { BOService } from '../services/BOService';
import { Dayjs } from 'dayjs';


export const BODashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  interface Statistics {
    monthlyTrends?: any[];
    // add other statistics properties here
  }
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);


  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const dateRangeParam = dateRange 
        ? { startDate: dateRange[0].format('YYYY-MM-DD'), endDate: dateRange[1].format('YYYY-MM-DD') }
        : undefined;
      const data = await BOService.getStatistics(dateRangeParam);
      setStatistics(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <PageHeader 
          title="Budgetary Offers Dashboard"
          actions={[
            <DatePicker.RangePicker
              onChange={(dates) => dates ? setDateRange([dates[0]!, dates[1]!]) : setDateRange(null)}
              className="w-64"
            />
          ]}
        />
        
        <StatisticsCards loading={loading} statistics={statistics} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <div className="lg:col-span-2">
            <TrendsChart loading={loading} data={statistics?.monthlyTrends ?? []} />
          </div>
          <div>
            <StatusDistribution loading={loading} statistics={statistics} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BODashboardPage;