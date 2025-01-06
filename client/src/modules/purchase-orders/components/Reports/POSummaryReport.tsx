// src/modules/purchase-orders/components/Reports/POSummaryReport.tsx
import { Card, Table, DatePicker, Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useQuery } from '../../../../hooks/useQuery';
import { reportApi } from '../../services/report';
import { formatCurrency } from '../../../../utils/format';
import styles from './Reports.module.css';

const { RangePicker } = DatePicker;

export const POSummaryReport = () => {
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

  const { data, loading } = useQuery({
    queryFn: () => reportApi.getPOSummary(dateRange?.[0], dateRange?.[1]),
    enabled: !!dateRange,
  });

  const columns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Total POs',
      dataIndex: 'totalPOs',
      key: 'totalPOs',
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      key: 'completed',
    },
    {
      title: 'In Progress',
      dataIndex: 'inProgress',
      key: 'inProgress',
    },
    {
      title: 'Cancelled',
      dataIndex: 'cancelled',
      key: 'cancelled',
    },
  ];

  const handleExport = async () => {
    try {
      await reportApi.exportPOSummary(dateRange?.[0], dateRange?.[1]);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Card title="PO Summary Report">
      <Space className={styles.controls}>
        <RangePicker
          onChange={(dates) => setDateRange(dates as [Date, Date])}
        />
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        className={styles.reportTable}
      />
    </Card>
  );
};