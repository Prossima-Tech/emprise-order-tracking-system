// src/modules/master-data/pages/ItemMasterPage.tsx
import React, { useEffect, useState } from 'react';
import { Card, Table, Modal, Form, Button, message } from 'antd';
import { ItemMaster } from '@emprise/shared/src/types/master';
import { masterDataApi } from '../services/masterDataApi';
import { SearchHeader } from '../components/SearchHeader';
import { ItemMasterForm } from '../components/ItemMasterForm';
import { StatusBadge } from '../components/StatusBadge';
import { useMasterData } from '../hooks/useMasterData';

export const ItemMasterPage: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemMaster | null>(null);

  const {
    data: items,
    loading,
    total,
    current,
    pageSize,
    fetchData,
    handleSearch,
    handleTableChange,
  } = useMasterData<ItemMaster>(masterDataApi.getAllItems, 'items');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await masterDataApi.updateItem(editingItem.id, values);
        message.success('Item updated successfully');
      } else {
        await masterDataApi.createItem(values);
        message.success('Item created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to save item');
    }
  };

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <StatusBadge status={isActive} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ItemMaster) => (
        <Button
          type="link"
          onClick={() => {
            setEditingItem(record);
            form.setFieldsValue(record);
            setModalVisible(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card title="Item Master">
        <SearchHeader
          onSearch={handleSearch}
          onAdd={() => {
            setEditingItem(null);
            form.resetFields();
            setModalVisible(true);
          }}
          addButtonText="Add Item"
          searchPlaceholder="Search items..."
        />

        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          pagination={{
            total,
            current,
            pageSize,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          rowKey="id"
        />

        <Modal
          title={editingItem ? 'Edit Item' : 'Add New Item'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSubmit}
        >
          <ItemMasterForm
            form={form}
            initialValues={editingItem || {}}
          />
        </Modal>
      </Card>
    </div>
  );
};

export default ItemMasterPage;  