// src/modules/master-data/pages/VendorMasterPage.tsx
import React, { useEffect, useState } from 'react';
import { Card, Table, Modal, Form, Button, message } from 'antd';
import { Vendor } from '@emprise/shared/src/types/master';
import { masterDataApi } from '../services/masterDataApi';
import { SearchHeader } from '../components/SearchHeader';
import { VendorMasterForm } from '../components/VendorMasterForm';
import { StatusBadge } from '../components/StatusBadge';
import { useMasterData } from '../hooks/useMasterData';

export const VendorMasterPage: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const {
    data: vendors,
    loading,
    total,
    current,
    pageSize,
    fetchData,
    handleSearch,
    handleTableChange,
  } = useMasterData<Vendor>(masterDataApi.getAllVendors, 'vendors');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingVendor) {
        await masterDataApi.updateVendor(editingVendor.id, values);
        message.success('Vendor updated successfully');
      } else {
        await masterDataApi.createVendor(values);
        message.success('Vendor created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to save vendor');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (categories: string[]) => categories.join(', '),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} type="status" />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Vendor) => (
        <Button
          type="link"
          onClick={() => {
            setEditingVendor(record);
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
      <Card title="Vendor Master">
        <SearchHeader
          onSearch={handleSearch}
          onAdd={() => {
            setEditingVendor(null);
            form.resetFields();
            setModalVisible(true);
          }}
          addButtonText="Add Vendor"
          searchPlaceholder="Search vendors..."
        />

        <Table
          columns={columns}
          dataSource={vendors}
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
          title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSubmit}
          width={800}
        >
          <VendorMasterForm
            form={form}
            initialValues={editingVendor || {}}
          />
        </Modal>
      </Card>
    </div>
  );
};

export default VendorMasterPage;