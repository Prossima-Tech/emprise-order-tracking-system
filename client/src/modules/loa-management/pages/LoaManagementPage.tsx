import { useState } from 'react';
import { 
  Button, 
  Card, 
  Statistic, 
  message,
  Typography,
  Space,
  Row,
  Col,
} from 'antd';
const { Text } = Typography;
import { 
  PlusOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { useQuery } from '../../../hooks/useQuery';
import { loaApi } from '../services/api';
import { CreateLOAModal } from '../components/CreateLOAModal';
import { LOAList } from '../components/LOAList';
import { LOADetailsDrawer } from '../components/LOADetailsDrawer';
import type { LOA, LOAStatus } from '@emprise/shared/src/types/loa';
import { toNumber } from '../../../utils/decimal';
import Title from 'antd/es/typography/Title';


// Dummy LOA data with proper Decimal values
const DUMMY_LOAS: LOA[] = [
  {
    id: 'LOA001',
    loaNo: 'LOA2023001',
    offerId: 'OFF001',
    value: (1500000),
    scope: 'Annual maintenance of power plant equipment',
    status: 'ACTIVE' as LOAStatus,
    issuingAuthority: 'Power Generation Corp',
    referenceNumber: 'REF001',
    receivedDate: new Date('2023-01-15'),
    validityPeriod: new Date('2024-01-14'),
    projectCode: 'PRJ001',
    department: 'ENG',
    recordedById: 'USER001',
    managedById: 'USER001',
    recordedBy: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      department: {
        deptCode: 'ENG',
        deptName: 'Engineering'
      }
    },
    offer: {
      tenderNo: 'TNR2023001',
      amount: (1600000),
      status: 'AWARDED'
    }
  },
  {
    id: 'LOA002',
    loaNo: 'LOA2023002',
    offerId: 'OFF002',
    value: 2500000,
    scope: 'Solar panel installation and commissioning',
    status: 'ACTIVE' as LOAStatus,
    issuingAuthority: 'Renewable Energy Board',
    referenceNumber: 'REF002',
    receivedDate: new Date('2023-02-20'),
    validityPeriod: new Date('2024-02-19'),
    projectCode: 'PRJ002',
    department: 'PRJ',
    recordedById: 'USER002',
    managedById: 'USER002',
    recordedBy: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      department: {
        deptCode: 'PRJ',
        deptName: 'Projects'
      }
    },
    offer: {
      tenderNo: 'TNR2023002',
      amount: (2600000),
      status: 'AWARDED'
    }
  },
  {
    id: 'LOA003',
    loaNo: 'LOA2023003',
    offerId: 'OFF003',
    value: (3500000),
    scope: 'Grid modernization project',
    status: 'COMPLETED' as LOAStatus,
    issuingAuthority: 'State Electricity Board',
    referenceNumber: 'REF003',
    receivedDate: new Date('2023-03-10'),
    validityPeriod: new Date('2024-03-09'),
    projectCode: 'PRJ003',
    department: 'OPS',
    recordedById: 'USER003',
    managedById: 'USER003',
    recordedBy: {
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      department: {
        deptCode: 'OPS',
        deptName: 'Operations'
      }
    },
    offer: {
      tenderNo: 'TNR2023003',
      amount: (3600000),
      status: 'AWARDED'
    }
  }
];

export const LOAManagementPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLOA, setSelectedLOA] = useState<LOA | null>(null);

  // Mock API call with dummy data
  const { 
    data: loas, 
    loading, 
    error, 
    refetch 
  } = useQuery<LOA[]>({
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return DUMMY_LOAS;
    },
  });

  const getStatistics = () => {
    if (!loas) return { 
      total: 0, 
      active: 0, 
      completed: 0,
      totalValue: 0
    };
    
    return {
      total: loas.length,
      active: loas.filter(loa => loa.status === 'ACTIVE').length,
      completed: loas.filter(loa => loa.status === 'COMPLETED').length,
      totalValue: loas.reduce((sum, loa) => sum + toNumber(loa.value), 0)
    };
  };

  const stats = getStatistics();

  const handleExport = () => {
    message.success('Exporting LOA data...');
    // Implement export logic here
  };

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} className="!mb-1">LOA Management</Title>
          <Text type="secondary">Manage and track Letters of Acceptance</Text>
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
            onClick={() => setIsCreateModalOpen(true)}
          >
            Record New LOA
          </Button>
        </Space>
      </div>

      {/* Statistics Section */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <FileTextOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
              <Statistic
                title="Total LOAs"
                value={stats.total}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <DollarCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-green-50 text-green-500" />
              <Statistic
                title="Total Value"
                value={toNumber(stats.totalValue)}
                precision={2}
                prefix="₹"
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <ClockCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-orange-50 text-orange-500" />
              <Statistic
                title="Active LOAs"
                value={stats.active}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-green-50 text-green-500" />
              <Statistic
                title="Completed"
                value={stats.completed}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* LOA List Section */}
      <Card className="shadow-sm">
        <LOAList
          loas={loas || []}
          loading={loading}
          onRefresh={refetch}
          onViewDetails={setSelectedLOA}
        />
      </Card>

      {/* Modals and Drawers */}
      <CreateLOAModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          message.success('LOA recorded successfully');
          refetch();
        }}
      />

      <LOADetailsDrawer
        loa={selectedLOA}
        open={!!selectedLOA}
        onClose={() => setSelectedLOA(null)}
      />
    </div>
  );
};


export default LOAManagementPage;