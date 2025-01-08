import { Table, Button, InputNumber, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';

interface WorkItem {
  key: string;
  description: string;
  basicRate: number;
  unit: string;
  taxRate: number;
}

interface WorkItemsTableProps {
  value?: WorkItem[];
  onChange?: (items: WorkItem[]) => void;
}

export const WorkItemsTable: React.FC<WorkItemsTableProps> = ({ value = [], onChange }) => {
  const [items, setItems] = React.useState<(WorkItem & { key: string })[]>(() => 
    value.map(item => ({ ...item, key: Math.random().toString(36).substr(2, 9) }))
  );

  useEffect(() => {
    if (onChange) {
      onChange(items);
    }
  }, [items, onChange]);

  const addItem = () => {
    const newItem = {
      key: Math.random().toString(36).substr(2, 9),
      description: '',
      basicRate: 0,
      unit: '',
      taxRate: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const updateItem = (key: string, field: keyof WorkItem, value: any) => {
    setItems(items.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      width: '40%',
      render: (_: any, record: any) => (
        <Input.TextArea
          rows={2}
          value={record.description}
          onChange={e => updateItem(record.key, 'description', e.target.value)}
          placeholder="Enter work item description"
        />
      ),
    },
    {
      title: 'Basic Rate',
      dataIndex: 'basicRate',
      width: '20%',
      render: (_: any, record: any) => (
        <InputNumber
          style={{ width: '100%' }}
          value={record.basicRate}
          onChange={value => updateItem(record.key, 'basicRate', value)}
          formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value!.replace(/₹\s?|(,*)/g, '')}
          min={0}
        />
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      width: '15%',
      render: (_: any, record: any) => (
        <Input
          value={record.unit}
          onChange={e => updateItem(record.key, 'unit', e.target.value)}
          placeholder="Unit"
        />
      ),
    },
    {
      title: 'Tax Rate (%)',
      dataIndex: 'taxRate',
      width: '15%',
      render: (_: any, record: any) => (
        <InputNumber
          style={{ width: '100%' }}
          value={record.taxRate}
          onChange={value => updateItem(record.key, 'taxRate', value)}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          parser={value => value!.replace('%', '')}
        />
      ),
    },
    {
      title: 'Action',
      width: '10%',
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.basicRate * (1 + item.taxRate / 100);
      return sum + itemTotal;
    }, 0);
  };

  return (
    <div>
      <Table
        dataSource={items}
        columns={columns}
        pagination={false}
        rowKey="key"
        className="mb-4"
      />
      <div className="flex justify-between items-center mt-4">
        <Button
          type="dashed"
          onClick={addItem}
          icon={<PlusOutlined />}
        >
          Add Work Item
        </Button>
        <div className="text-right">
          <div className="text-gray-600 mb-1">Total Value</div>
          <div className="text-lg font-semibold">
            ₹ {calculateTotal().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkItemsTable;