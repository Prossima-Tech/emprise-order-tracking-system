import { BudgetaryOfferStatus } from '@emprise/shared/src/types/budgetary-offer';

import React, { useEffect, useState } from 'react';
import { Table, Card, Input, DatePicker, Select, Button, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { StatusBadge } from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import { boService } from '../services/boServices';

const { RangePicker } = DatePicker;
const { Option } = Select;

export const BOList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await boService.listOffers({
        page: pagination.current,
        limit: pagination.pageSize
      });
      setData(response.data);
      setPagination({
        ...pagination,
        total: response.pagination.total
      });
    } catch (error) {
      message.error('Failed to fetch budgetary offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    {
      title: 'From Authority',
      dataIndex: 'fromAuthority',
      key: 'fromAuthority',
      width: '20%',
    },
    {
      title: 'To Authority',
      dataIndex: 'toAuthority',
      key: 'toAuthority',
      width: '20%',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'EMD Amount',
      dataIndex: ['emdDetails', 'amount'],
      key: 'emdAmount',
      width: '10%',
      render: (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status: BudgetaryOfferStatus) => <StatusBadge status={status} />,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      render: (record: any) => (
        <Button type="link" onClick={() => navigate(`/budgetary-offers/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search by authority"
          prefix={<SearchOutlined />}
          className="w-64"
        />
        <RangePicker className="w-64" />
        <Select defaultValue="" className="w-32">
          <Option value="">All Status</Option>
          {Object.values(BudgetaryOfferStatus).map(status => (
            <Option key={status} value={status}>{status}</Option>
          ))}
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/budgetary-offers/create')}
        >
          Create New
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={(newPagination) => {
          setPagination({
            ...pagination,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 10,
          });
        }}
      />
    </Card>
  );
};

export default BOList;