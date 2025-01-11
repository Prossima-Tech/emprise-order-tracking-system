import React from 'react';
import { Card, Descriptions, Table } from 'antd';
import { WorkItem } from '../../../types/budgetary-offer';

interface BODetailsProps {
  offer: any;
}

export const BODetails: React.FC<BODetailsProps> = ({ offer }) => {
  const workItemColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
    },
    {
      title: 'Basic Rate',
      dataIndex: 'basicRate',
      key: 'basicRate',
      width: '20%',
      render: (value: number) => `₹ ${value.toLocaleString('en-IN')}`,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: '15%',
    },
    {
      title: 'Tax Rate',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: '15%',
      render: (value: number) => `${value}%`,
    },
    {
      title: 'Total Value',
      key: 'totalValue',
      width: '20%',
      render: (_: any, record: WorkItem) => {
        const total = record.basicRate * (1 + record.taxRate / 100);
        return `₹ ${total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
      },
    },
  ];

  const calculateTotal = () => {
    return offer.workItems.reduce((sum: number, item: WorkItem) => {
      return sum + (item.basicRate * (1 + item.taxRate / 100));
    }, 0);
  };

  return (
    <div className="space-y-6">
      <Card title="Basic Details">
        <Descriptions column={2}>
          <Descriptions.Item label="From Authority">
            {offer.fromAuthority}
          </Descriptions.Item>
          <Descriptions.Item label="To Authority">
            {offer.toAuthority}
          </Descriptions.Item>
          <Descriptions.Item label="Subject" span={2}>
            {offer.subject}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card 
        title="Work Items" 
        extra={
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Value</div>
            <div className="text-lg font-semibold">
              ₹ {calculateTotal().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
        }
      >
        <Table
          columns={workItemColumns}
          dataSource={offer.workItems.map((item: WorkItem, index: number) => ({
            ...item,
            key: index,
          }))}
          pagination={false}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>
                    ₹ {calculateTotal().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      <Card title="EMD Details">
        <Descriptions column={2}>
          <Descriptions.Item label="Amount">
            ₹ {offer.emdDetails.amount.toLocaleString('en-IN')}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Mode">
            {offer.emdDetails.paymentMode}
          </Descriptions.Item>
          <Descriptions.Item label="Validity Period">
            {offer.emdDetails.validityPeriod} days
          </Descriptions.Item>
          {offer.emdDetails.remarks && (
            <Descriptions.Item label="Remarks">
              {offer.emdDetails.remarks}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Terms and Conditions">
        <div 
          className="terms-content"
          dangerouslySetInnerHTML={{ __html: offer.termsAndConditions }} 
        />
      </Card>
    </div>
  );
};

export default BODetails;