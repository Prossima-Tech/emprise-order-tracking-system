// src/modules/loa-management/pages/LOAManagementPage.tsx
import { useState } from 'react';
import { Button, Card, Statistic, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '../../../hooks/useQuery';
import { loaApi } from '../services/api';
import { CreateLOAModal } from '../components/CreateLOAModal';
import { LOAList } from '../components/LOAList';
import { LOADetailsDrawer } from '../components/LOADetailsDrawer';
import type { LOA, LOAStatus } from '@emprise/shared/src/types/loa';

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
  const { data: loas, loading, error, refetch } = useQuery<LOA[]>({
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return DUMMY_LOAS;
    },
  });

  const getStatistics = () => {
    if (!loas) return { total: 0, active: 0, completed: 0 };
    return {
      total: loas.length,
      active: loas.filter(loa => loa.status === 'ACTIVE').length,
      completed: loas.filter(loa => loa.status === 'COMPLETED').length,
    };
  };

  const stats = getStatistics();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">LOA Management</h1>
          <p className="text-gray-600">Manage Letters of Acceptance</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Record New LOA
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <Statistic
            title="Total LOAs"
            value={stats.total}
            className="text-center"
          />
        </Card>
        <Card className="shadow-sm">
          <Statistic
            title="Active LOAs"
            value={stats.active}
            className="text-center text-green-600"
          />
        </Card>
        <Card className="shadow-sm">
          <Statistic
            title="Completed LOAs"
            value={stats.completed}
            className="text-center text-blue-600"
          />
        </Card>
      </div>

      {/* LOA List */}
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