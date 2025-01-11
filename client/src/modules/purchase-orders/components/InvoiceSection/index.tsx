// src/modules/purchase-orders/components/InvoiceSection/index.tsx
import { Card, Button, Table, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { useQuery } from '../../../../hooks/useQuery';
import { invoiceApi } from '../../services/invoice';
import { formatCurrency } from '../../../../utils/format';
import styles from './InvoiceSection.module.css';

interface InvoiceSectionProps {
  poId: string;
}

export const InvoiceSection = ({ poId }: InvoiceSectionProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: invoices, loading, refetch } = useQuery({
    queryFn: () => invoiceApi.getInvoicesByPO(poId),
  });

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getInvoiceStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Paid Date',
      dataIndex: 'paidDate',
      key: 'paidDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  return (
    <Card
      title="Invoices"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Invoice
        </Button>
      }
      className={styles.section}
    >
      <Table
        columns={columns}
        dataSource={invoices}
        loading={loading}
        rowKey="id"
      />

      <CreateInvoiceModal
        poId={poId}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </Card>
  );
};