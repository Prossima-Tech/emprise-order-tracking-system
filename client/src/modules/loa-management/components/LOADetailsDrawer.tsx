// src/modules/loa-management/components/LOADetailsDrawer.tsx
import { Drawer, Descriptions, Tag, Tabs, Button } from 'antd';
import { DocumentManager } from './DocumentManager';
import { AmendmentList } from './AmendmentList';
import type { LOA } from '@emprise/shared/src/types/loa';
import { formatCurrency } from '../../../utils/format';
import { toNumber } from '../../../utils/decimal';

interface LOADetailsDrawerProps {
  loa: LOA | null;
  open: boolean;
  onClose: () => void;
}

export const LOADetailsDrawer = ({ loa, open, onClose }: LOADetailsDrawerProps) => {
  if (!loa) return null;

  return (
    <Drawer
      title="LOA Details"
      placement="right"
      onClose={onClose}
      open={open}
      width={800}
      extra={
        <Button type="primary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="LOA No." span={2}>
            {loa.loaNo}
          </Descriptions.Item>
          <Descriptions.Item label="Project Code">
            {loa.projectCode}
          </Descriptions.Item>
          <Descriptions.Item label="Department">
            {loa.department}
          </Descriptions.Item>
          <Descriptions.Item label="Value">
            {formatCurrency(toNumber(loa.value))}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={loa.status === 'ACTIVE' ? 'green' : 'blue'}>
              {loa.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Issuing Authority" span={2}>
            {loa.issuingAuthority}
          </Descriptions.Item>
          <Descriptions.Item label="Received Date">
            {new Date(loa.receivedDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Validity Period">
            {new Date(loa.validityPeriod).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Scope" span={2}>
            {loa.scope}
          </Descriptions.Item>
          {loa.remarks && (
            <Descriptions.Item label="Remarks" span={2}>
              {loa.remarks}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Tabs
          items={[
            {
              key: 'documents',
              label: 'Documents',
              children: <DocumentManager loaId={loa.id} />,
            },
            {
              key: 'amendments',
              label: 'Amendments',
              children: <AmendmentList loaId={loa.id} />,
            },
          ]}
        />
      </div>
    </Drawer>
  );
};