// src/modules/purchase-orders/components/ItemSelectionModal.tsx
import { Modal, Form, Select, InputNumber, Table } from 'antd';
import { useState } from 'react';
import { POItem } from '@emprise/shared/src/types/purchase-order';
import { ItemMaster } from '@emprise/shared/src/types/master';
import { useQuery } from '../../../hooks/useQuery';
import styles from './ItemSelectionModal.module.css';

interface ItemSelectionModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (item: POItem) => void;
  initialItem?: POItem;
}

export const ItemSelectionModal = ({
  open,
  onCancel,
  onSelect,
  initialItem,
}: ItemSelectionModalProps) => {
  const [form] = Form.useForm();
  const [selectedItem, setSelectedItem] = useState<ItemMaster | null>(null);

  const { data: items, loading } = useQuery({
    queryFn: () => itemApi.getAllItems(),
    enabled: open,
  });

  const handleItemSelect = (itemId: string) => {
    const item = items?.find(i => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      // Set default specifications
      const specs = item.specifications.reduce((acc, spec) => {
        acc[spec.key] = spec.value;
        return acc;
      }, {} as Record<string, string>);
      form.setFieldsValue({ specifications: specs });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { quantity, unitPrice, specifications } = values;
      if (selectedItem) {
        onSelect({
          itemId: selectedItem.id,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
          specifications,
          item: {
            itemCode: selectedItem.itemCode,
            description: selectedItem.description,
            unit: selectedItem.unit,
          },
        });
      }
    } catch (error) {
      // Handle error
    }
  };

  const specificationColumns = [
    {
      title: 'Specification',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Value',
      dataIndex: 'key',
      key: 'value',
      render: (key: string) => (
        <Form.Item
          name={['specifications', key]}
          rules={[{ required: true, message: 'Required' }]}
          noStyle
        >
          <Input />
        </Form.Item>
      ),
    },
  ];

  return (
    <Modal
      title="Select Item"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialItem}
      >
        <Form.Item
          name="itemId"
          label="Item"
          rules={[{ required: true, message: 'Please select item' }]}
        >
          <Select
            placeholder="Select item"
            showSearch
            optionFilterProp="children"
            onChange={handleItemSelect}
            loading={loading}
          >
            {items?.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.itemCode} - {item.description}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {selectedItem && (
          <>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Please enter quantity' }]}
            >
              <InputNumber min={1} className={styles.numberInput} />
            </Form.Item>

            <Form.Item
              name="unitPrice"
              label="Unit Price"
              rules={[{ required: true, message: 'Please enter unit price' }]}
            >
              <InputNumber
                className={styles.numberInput}
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/₹\s?|(,*)/g, '')}
              />
            </Form.Item>

            <div className={styles.specificationsTable}>
              <Table
                dataSource={selectedItem.specifications}
                columns={specificationColumns}
                pagination={false}
                rowKey="key"
              />
            </div>
          </>
        )}
      </Form>
    </Modal>
  );
};