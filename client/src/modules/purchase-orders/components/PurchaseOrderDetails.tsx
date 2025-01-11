// src/modules/purchase-orders/components/PurchaseOrderDetails.tsx
import React from 'react';
import { Card, Descriptions, Table, Timeline, Tag, Button, Space, Tooltip, Typography, Divider } from 'antd';
import { 
  ClockCircleOutlined, 
  ShoppingCartOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { PurchaseOrder, POStatus } from '../../../types/purchase-order';
import { formatCurrency } from '../../../utils/format';

const { Text } = Typography;

export interface PurchaseOrderDetailsProps {
  po: PurchaseOrder;
  loading: boolean;
  onStatusUpdate?: (status: POStatus) => void;
}

export const PurchaseOrderDetails: React.FC<PurchaseOrderDetailsProps> = ({
  po,
  loading,
  onStatusUpdate,
}) => {
  // Status configuration for consistent styling
  const statusConfig: Record<POStatus, { color: string; icon: React.ReactNode }> = {
    [POStatus.DRAFT]: { 
      color: 'default',
      icon: <ClockCircleOutlined />
    },
    [POStatus.ISSUED]: { 
      color: 'processing',
      icon: <ShoppingCartOutlined />
    },
    [POStatus.IN_PROGRESS]: { 
      color: 'warning',
      icon: <ClockCircleOutlined />
    },
    [POStatus.COMPLETED]: { 
      color: 'success',
      icon: <CheckCircleOutlined />
    },
    [POStatus.CANCELLED]: { 
      color: 'error',
      icon: <CloseCircleOutlined />
    }
  };

  const itemColumns = [
    {
      title: 'Item Code',
      dataIndex: ['item', 'itemCode'],
      key: 'itemCode',
      width: '15%',
      render: (text: string) => (
        <Text className="font-medium">{text}</Text>
      )
    },
    {
      title: 'Description',
      dataIndex: ['item', 'description'],
      key: 'description',
      width: '35%',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate max-w-[400px]">{text}</div>
        </Tooltip>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      align: 'right' as const,
      render: (value: number) => (
        <Text className="font-mono">{value.toLocaleString()}</Text>
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '15%',
      align: 'right' as const,
      render: (value: number) => (
        <Text className="font-mono">{formatCurrency(value)}</Text>
      )
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: '20%',
      align: 'right' as const,
      render: (value: number) => (
        <Text className="font-mono font-medium">{formatCurrency(value)}</Text>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <Card loading={loading} className="shadow-sm">
        <Descriptions 
          title={
            <Space>
              <ShoppingCartOutlined className="text-blue-500" />
              PO Information
            </Space>
          }
          bordered 
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          <Descriptions.Item 
            label={<Space><FileTextOutlined />PO Number</Space>}
            className="font-medium"
          >
            {po.poNumber}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<Space><ClockCircleOutlined />Status</Space>}
          >
            <Tag 
              color={statusConfig[po.status as POStatus]?.color}
              icon={statusConfig[po.status as POStatus]?.icon}
              className="px-3 py-1"
            >
              {po.status.replace('_', ' ')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item 
            label={<Space><UserOutlined />Vendor</Space>}
          >
            <Tooltip title={po.vendor?.email}>
              {po.vendor?.name}
            </Tooltip>
          </Descriptions.Item>
          <Descriptions.Item 
            label={<Space><FileTextOutlined />LOA Number</Space>}
          >
            {po.loa?.loaNo}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<Space><DollarOutlined />Value</Space>}
          >
            <Text className="font-mono font-medium">
              {formatCurrency(Number(po.value))}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item 
            label={<Space><CalendarOutlined />Delivery Date</Space>}
          >
            {new Date(po.deliveryDate).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Items Card */}
      <Card 
        title={
          <Space>
            <ShoppingCartOutlined className="text-blue-500" />
            Order Items
          </Space>
        } 
        loading={loading}
        className="shadow-sm"
      >
        <Table
          columns={itemColumns}
          dataSource={po.items || []}
          pagination={false}
          rowKey="id"
          className="border border-gray-200 rounded-lg overflow-hidden"
          summary={(pageData) => {
            const total = pageData.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            return (
              <Table.Summary.Row className="bg-gray-50 font-medium">
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  Total Amount:
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text className="font-mono font-medium">
                    {formatCurrency(total)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      {/* Status History Card */}
      {po.statusHistory && po.statusHistory.length > 0 && (
        <Card 
          title={
            <Space>
              <ClockCircleOutlined className="text-blue-500" />
              Status History
            </Space>
          } 
          loading={loading}
          className="shadow-sm"
        >
          <Timeline>
            {po.statusHistory.map((history) => (
              <Timeline.Item 
                key={history.id}
                color={statusConfig[history.toStatus as POStatus]?.color}
                dot={statusConfig[history.toStatus as POStatus]?.icon}
              >
                <div className="flex flex-col gap-1">
                  <Space>
                    <Tag color="default">{history.fromStatus || 'INITIAL'}</Tag>
                    <span>→</span>
                    <Tag color={statusConfig[history.toStatus as POStatus]?.color}>
                      {history.toStatus}
                    </Tag>
                  </Space>
                  <Text type="secondary" className="text-sm">
                    {new Date(history.createdAt).toLocaleString()}
                  </Text>
                  {history.remarks && (
                    <Text className="text-gray-600 text-sm">
                      {history.remarks}
                    </Text>
                  )}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}
    </div>
  );
};

export default PurchaseOrderDetails;