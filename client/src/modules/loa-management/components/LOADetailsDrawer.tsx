// src/modules/loa-management/components/LOADetailsDrawer.tsx
import { Drawer, Descriptions, Tag, Tabs, Button, Space, Typography, Card } from 'antd';
import { 
  FileTextOutlined,
  ProjectOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  BankOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  MessageOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  PrinterOutlined,
  EditOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { DocumentManager } from './DocumentManager';
import { AmendmentList } from './AmendmentList';
import type { LOA, LOAStatus } from '@emprise/shared/src/types/loa';
import { formatCurrency } from '../../../utils/format';
import { toNumber } from '../../../utils/decimal';

const { Title, Text } = Typography;

interface LOADetailsDrawerProps {
  loa: LOA | null;
  open: boolean;
  onClose: () => void;
}

export const LOADetailsDrawer = ({ loa, open, onClose }: LOADetailsDrawerProps) => {
  if (!loa) return null;

  const statusConfig = {
    ACTIVE: { color: 'green', icon: <ClockCircleOutlined /> },
    COMPLETED: { color: 'blue', icon: <CheckCircleOutlined /> },
    CANCELLED: { color: 'red', icon: <CloseCircleOutlined /> },
    DRAFT: { color: 'orange', icon: <EditOutlined /> }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center">
          <FileTextOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
          <div>
            <Title level={5} className="!mb-0">{loa.loaNo}</Title>
            <Text type="secondary">Letter of Acceptance Details</Text>
          </div>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={800}
      extra={
        <Space>
          <Button icon={<PrinterOutlined />}>Print</Button>
          <Button 
            icon={<EditOutlined />} 
            disabled={loa.status !== 'DRAFT' as LOAStatus}
          >
            Edit
          </Button>
          <Button icon={<CloseOutlined />} onClick={onClose}>Close</Button>
        </Space>
      }
      className="loa-details-drawer"
    >
      <div className="space-y-6">
        <Card className="shadow-sm">
          <Descriptions 
            bordered 
            column={2}
            labelStyle={{ fontWeight: 500 }}
          >
            <Descriptions.Item 
              label={<Space><FileTextOutlined />LOA Number</Space>}
              span={2}
            >
              <Text strong>{loa.loaNo}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><ProjectOutlined />Project Code</Space>}
            >
              {loa.projectCode}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><TeamOutlined />Department</Space>}
            >
              {loa.department}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><DollarOutlined />Value</Space>}
            >
              <Text className="font-mono font-medium">
                {formatCurrency(toNumber(loa.value))}
              </Text>
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><ClockCircleOutlined />Status</Space>}
            >
              <Tag 
                color={statusConfig[loa.status].color}
                icon={statusConfig[loa.status].icon}
                className="px-3 py-1 rounded-full"
              >
                {loa.status}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><BankOutlined />Issuing Authority</Space>}
              span={2}
            >
              {loa.issuingAuthority}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><CalendarOutlined />Received Date</Space>}
            >
              {new Date(loa.receivedDate).toLocaleDateString()}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><CalendarOutlined />Validity Period</Space>}
            >
              {new Date(loa.validityPeriod).toLocaleDateString()}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><FileSearchOutlined />Scope</Space>}
              span={2}
            >
              {loa.scope}
            </Descriptions.Item>
            
            {loa.remarks && (
              <Descriptions.Item 
                label={<Space><MessageOutlined />Remarks</Space>}
                span={2}
              >
                {loa.remarks}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Tabs
          items={[
            {
              key: 'documents',
              label: (
                <Space>
                  <FileDoneOutlined />
                  Documents
                </Space>
              ),
              children: <DocumentManager loaId={loa.id} />,
            },
            {
              key: 'amendments',
              label: (
                <Space>
                  <HistoryOutlined />
                  Amendments
                </Space>
              ),
              children: <AmendmentList loaId={loa.id} />,
            },
          ]}
          className="custom-tabs"
        />
      </div>
    </Drawer>
  );
};

export default LOADetailsDrawer;