import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import ActionButtons from './ActionButtons';

interface TableData {
    id: string | number;
    offerDate: string;
    subject: string;
    fromAuthority: string;
    toAuthority: string;
    status: StatusType;
    // add other fields as needed
  }
  
  interface TablePagination {
    current: number;
    pageSize: number;
    total: number;
  }

interface BOTableProps {
  loading: boolean;
  data: TableData[];
  pagination: TablePagination;
  onChange: (pagination: any) => void;

}

type StatusType = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED';

const BOTable: React.FC<BOTableProps> = ({ loading, data, pagination, onChange }) => {
    const statusColors: Record<StatusType  ,string> = {
        DRAFT: 'gray',
        PENDING_APPROVAL: 'orange',
        APPROVED: 'green'
      } as const;

  const columns = [
    {
      title: 'Offer Date',
      dataIndex: 'offerDate',
      key: 'offerDate',
      render: (date: string) => format(new Date(date), 'dd/MM/yyyy')
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate max-w-md">{text}</div>
        </Tooltip>
      )
    },
    {
      title: 'From Authority',
      dataIndex: 'fromAuthority',
      key: 'fromAuthority',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate max-w-xs">{text}</div>
        </Tooltip>
      )
    },
    {
      title: 'To Authority',
      dataIndex: 'toAuthority',
      key: 'toAuthority',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate max-w-xs">{text}</div>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: StatusType) => (
        <Tag color={statusColors[status]}>
          {status === 'PENDING_APPROVAL' ? (
            <><ClockCircleOutlined /> PENDING</>
          ) : status === 'APPROVED' ? (
            <><CheckCircleOutlined /> APPROVED</>
          ) : (
            <><EditOutlined /> DRAFT</>
          )}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <ActionButtons record={record} />
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={pagination}
      onChange={onChange}
      loading={loading}
      scroll={{ x: true }}
    />
  );
};

export default BOTable;