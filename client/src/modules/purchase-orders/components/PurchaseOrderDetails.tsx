import { Card, Descriptions, Table, Timeline, Tag, Button, Space } from 'antd';
import { PurchaseOrder, POStatus } from '@emprise/shared/src/types/purchase-order';
import { formatCurrency } from '../../../utils/format';

export interface PurchaseOrderDetailsProps {
  po: PurchaseOrder;
  loading: boolean;
  onStatusUpdate?: (status: POStatus) => void;
}

export const PurchaseOrderDetails = ({
  po,
  loading,
  onStatusUpdate,
}: PurchaseOrderDetailsProps) => {
  const itemColumns = [
    {
      title: 'Item Code',
      dataIndex: ['item', 'itemCode'],
      key: 'itemCode',
    },
    {
      title: 'Description',
      dataIndex: ['item', 'description'],
      key: 'description',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value: number) => formatCurrency(value),
    },
  ];

  const getStatusColor = (status: POStatus) => {
    const colors: Record<POStatus, string> = {
      [POStatus.DRAFT]: 'default',
      [POStatus.ISSUED]: 'processing',
      [POStatus.IN_PROGRESS]: 'warning',
      [POStatus.COMPLETED]: 'success',
      [POStatus.CANCELLED]: 'error',
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <Card loading={loading}>
        <Descriptions title="PO Information" bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="PO Number">{po.poNumber}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(po.status as POStatus)}>
              {po.status.replace('_', ' ')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Vendor Name">
            {po.vendor?.name}
          </Descriptions.Item>
          <Descriptions.Item label="LOA Number">
            {po.loa?.loaNo}
          </Descriptions.Item>
          <Descriptions.Item label="Value">
            {formatCurrency(Number(po.value))}
          </Descriptions.Item>
          <Descriptions.Item label="Delivery Date">
            {new Date(po.deliveryDate).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Items" loading={loading}>
        <Table
          columns={itemColumns}
          dataSource={po.items || []}
          pagination={false}
          rowKey="id"
        />
      </Card>

      {po.statusHistory && po.statusHistory.length > 0 && (
        <Card title="Status History" loading={loading}>
          <Timeline>
            {po.statusHistory.map((history) => (
              <Timeline.Item key={history.id}>
                <p>
                  <Tag>{history.fromStatus || 'INITIAL'}</Tag> →{' '}
                  <Tag>{history.toStatus}</Tag>
                </p>
                <p className="text-gray-500">
                  {new Date(history.createdAt).toLocaleString()}
                </p>
                {history.remarks && (
                  <p className="text-gray-600">{history.remarks}</p>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}
    </div>
  );
};


export default PurchaseOrderDetails;