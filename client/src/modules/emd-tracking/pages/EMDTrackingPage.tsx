// src/modules/emd-tracking/pages/EMDTrackingPage.tsx
import { useState } from 'react';
import { 
  Button, 
  Card, 
  Statistic, 
  Typography, 
  Space,
  Row,
  Col,
  message 
} from 'antd';
import { 
  PlusOutlined,
  BankOutlined,
  DollarCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { EMDList } from '../components/EMDList';
import { EMDSubmissionModal } from '../components/EMDSubmissionModal';
import { useQuery } from '../../../hooks/useQuery';
import { emdApi } from '../services';
import { EMDTracking, EMDStatistics, EMDFilter, EMDStatus } from '@emprise/shared/src/types/emd';
import type { PaginatedResponse } from '@emprise/shared/src/types/common';
import { toNumber } from '../../../utils/decimal';

const { Title, Text } = Typography;

// Dummy EMD data
const DUMMY_EMDS: EMDTracking[] = [
  {
    id: 'EMD001',
    tenderNo: 'TNR2023001',
    amount: 50000.00,  // Using number directly
    submissionDate: new Date('2023-12-01'),
    validityPeriod: new Date('2024-03-01'),
    returnDueDate: new Date('2024-03-15'),
    status: EMDStatus.SUBMITTED,
    bankName: 'State Bank of India',
    instrumentNo: 'BG123456',
    instrumentType: 'BANK_GUARANTEE',
    customerName: 'Power Generation Corp',
    department: 'Engineering',
    projectCode: 'PRJ001',
    remarks: 'Standard EMD for power plant tender',
    returnedDate: null,
    returnedBy: null
  },
  {
    id: 'EMD002',
    tenderNo: 'TNR2023002',
    amount: 60000.00,  // Using number directly
    submissionDate: new Date('2023-12-01'),
    validityPeriod: new Date('2024-03-01'),
    returnDueDate: new Date('2024-03-15'),
    status: EMDStatus.OVERDUE,
    bankName: 'State Bank of India',
    instrumentNo: 'BG123456',
    instrumentType: 'BANK_GUARANTEE',
    customerName: 'Power Generation Corp',
    department: 'Engineering',
    projectCode: 'PRJ001',
    remarks: 'Standard EMD for power plant tender',
    returnedDate: null,
    returnedBy: null
  },
];

export const EMDTrackingPage = () => {
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [filter, setFilter] = useState<EMDFilter>({
    page: 1,
    limit: 10,
    dateRange: [null, null],
  });

  // Mock API call with dummy data
  const { data: emdsResponse, loading: emdsLoading, refetch } = useQuery<PaginatedResponse<EMDTracking>>({
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const limit = filter.limit || 10;
      return {
        items: DUMMY_EMDS,
        total: DUMMY_EMDS.length,
        page: filter.page || 1,
        limit,
        totalPages: Math.ceil(DUMMY_EMDS.length / limit),
      };
    },
    dependencies: [filter],
  });

  // Mock statistics calculation
  const statistics: EMDStatistics = {
    total: DUMMY_EMDS.length,
    totalAmount: DUMMY_EMDS.reduce((sum, emd) => sum + emd.amount, 0),
    overdueCount: DUMMY_EMDS.filter(emd => emd.status === 'OVERDUE').length,
    returnedAmount: DUMMY_EMDS
      .filter(emd => emd.status === 'RETURNED')
      .reduce((sum, emd) => sum + emd.amount, 0),
    byStatus: {
      SUBMITTED: DUMMY_EMDS.filter(emd => emd.status === 'SUBMITTED').length,
      OVERDUE: DUMMY_EMDS.filter(emd => emd.status === 'OVERDUE').length,
      RETURNED: DUMMY_EMDS.filter(emd => emd.status === 'RETURNED').length,
      FORFEITED: DUMMY_EMDS.filter(emd => emd.status === 'FORFEITED').length,
      [EMDStatus.PENDING]: 0,
      [EMDStatus.VERIFIED]: 0
    },
    forfeitedAmount: 0 // Changed to number type with initial value 0
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter(prev => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  };

  const handleExport = () => {
    message.success('Exporting EMD data...');
    // Implement export logic here
  };

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} className="!mb-1">EMD Tracking</Title>
          <Text type="secondary">Track and manage Earnest Money Deposits</Text>
        </div>
        <Space>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsSubmissionModalOpen(true)}
          >
            Submit New EMD
          </Button>
        </Space>
      </div>

      {/* Statistics Section */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={emdsLoading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <BankOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
              <Statistic
                title="Total EMDs"
                value={statistics.total}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={emdsLoading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <DollarCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-green-50 text-green-500" />
              <Statistic
                title="Total Amount"
                value={toNumber(statistics.totalAmount)}
                precision={2}
                prefix="₹"
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={emdsLoading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <ExclamationCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-red-50 text-red-500" />
              <Statistic
                title="Overdue EMDs"
                value={statistics.overdueCount}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={emdsLoading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-green-50 text-green-500" />
              <Statistic
                title="Returned Amount"
                value={toNumber(statistics.returnedAmount)}
                precision={2}
                prefix="₹"
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* EMD List Section */}
      <Card className="shadow-sm">
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
      </Card>

      {/* Modals */}
      <EMDSubmissionModal
        open={isSubmissionModalOpen}
        onCancel={() => setIsSubmissionModalOpen(false)}
        onSuccess={() => {
          setIsSubmissionModalOpen(false);
          message.success('EMD submitted successfully');
          refetch();
        }}
      />
    </div>
  );
};

export default EMDTrackingPage;