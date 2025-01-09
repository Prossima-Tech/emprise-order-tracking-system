import React, { useEffect } from 'react';
import { 
  Table, 
  Button, 
  InputNumber, 
  Input, 
  Space, 
  Typography, 
  Tooltip, 
  Popconfirm,
  Select
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  CalculatorOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

// Common units for work items
const commonUnits = [
  { value: 'PCS', label: 'Pieces' },
  { value: 'MTR', label: 'Meters' },
  { value: 'KG', label: 'Kilograms' },
  { value: 'SET', label: 'Sets' },
  { value: 'LOT', label: 'Lot' },
];

interface WorkItem {
  key: string;
  description: string;
  basicRate: number;
  unit: string;
  taxRate: number;
  quantity: number;
}

interface WorkItemsTableProps {
  value?: WorkItem[];
  onChange?: (items: WorkItem[]) => void;
  onTotalChange?: (total: number) => void;
}

export const WorkItemsTable: React.FC<WorkItemsTableProps> = ({ 
  value = [], 
  onChange,
  onTotalChange 
}) => {
  const [items, setItems] = React.useState<WorkItem[]>(() => 
    value.map(item => ({ 
      ...item, 
      key: Math.random().toString(36).substr(2, 9),
      quantity: item.quantity || 1
    }))
  );

  useEffect(() => {
    if (onChange) {
      onChange(items);
    }
    if (onTotalChange) {
      onTotalChange(calculateTotal());
    }
  }, [items, onChange, onTotalChange]);

  const addItem = () => {
    const newItem = {
      key: Math.random().toString(36).substr(2, 9),
      description: '',
      basicRate: 0,
      unit: '',
      taxRate: 18, // Default GST rate
      quantity: 1
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

  const calculateItemTotal = (item: WorkItem) => {
    const baseAmount = item.basicRate * (item.quantity || 1);
    const withTax = baseAmount * (1 + item.taxRate / 100);
    return withTax;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const columns = [
    {
      title: (
        <Space>
          Description
          <Tooltip title="Enter detailed description of the work item">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'description',
      width: '30%',
      render: (_: any, record: WorkItem) => (
        <Input.TextArea
          rows={2}
          value={record.description}
          onChange={e => updateItem(record.key, 'description', e.target.value)}
          placeholder="Enter work item description"
          className="w-full"
        />
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: '12%',
      render: (_: any, record: WorkItem) => (
        <InputNumber
          className="w-full"
          value={record.quantity}
          onChange={value => updateItem(record.key, 'quantity', value)}
          min={1}
          precision={0}
          placeholder="Qty"
        />
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      width: '12%',
      render: (_: any, record: WorkItem) => (
        <Select
          value={record.unit}
          onChange={value => updateItem(record.key, 'unit', value)}
          placeholder="Select unit"
          className="w-full"
          showSearch
          allowClear
        >
          {commonUnits.map(unit => (
            <Option key={unit.value} value={unit.value}>
              {unit.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: (
        <Space>
          Basic Rate
          <Tooltip title="Price per unit excluding tax">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'basicRate',
      width: '15%',
      render: (_: any, record: WorkItem) => (
        <InputNumber
          className="w-full"
          value={record.basicRate}
          onChange={value => updateItem(record.key, 'basicRate', value)}
          formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => parseFloat(value!.replace(/₹\s?|(,*)/g, ''))}
          min={0}
        />
      ),
    },
    {
      title: (
        <Space>
          Tax Rate
          <Tooltip title="Applicable tax percentage">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'taxRate',
      width: '12%',
      render: (_: any, record: WorkItem) => (
        <InputNumber
          className="w-full"
          value={record.taxRate}
          onChange={value => updateItem(record.key, 'taxRate', value)}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          parser={value => parseFloat(value!.replace('%', ''))}
        />
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total',
      width: '12%',
      render: (_: any, record: WorkItem) => (
        <Text className="font-mono">
          ₹ {calculateItemTotal(record).toLocaleString('en-IN', { 
            maximumFractionDigits: 2 
          })}
        </Text>
      ),
    },
    {
      title: 'Action',
      width: '7%',
      render: (_: any, record: WorkItem) => (
        <Popconfirm
          title="Delete this item?"
          onConfirm={() => removeItem(record.key)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        dataSource={items}
        columns={columns}
        pagination={false}
        rowKey="key"
        className="border border-gray-200 rounded-lg overflow-hidden"
        summary={() => (
          <Table.Summary fixed="bottom">
            <Table.Summary.Row className="bg-gray-50">
              <Table.Summary.Cell index={0} colSpan={5}>
                <Text strong>Total Value (Including Tax)</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} colSpan={2}>
                <Text strong className="text-lg font-mono">
                  ₹ {calculateTotal().toLocaleString('en-IN', { 
                    maximumFractionDigits: 2 
                  })}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      <div className="flex justify-between items-center">
        <Button
          type="dashed"
          onClick={addItem}
          icon={<PlusOutlined />}
          className="hover:border-blue-500 hover:text-blue-500"
        >
          Add Work Item
        </Button>
        <Space>
          <Button icon={<CalculatorOutlined />}>
            Export Calculations
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default WorkItemsTable;