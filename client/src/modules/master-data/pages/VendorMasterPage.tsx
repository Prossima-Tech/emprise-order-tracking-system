// src/modules/master-data/pages/VendorMasterPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Modal, 
  Form, 
  Button, 
  message,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Tooltip,
  Dropdown,
  Tag
} from 'antd';
import { 
  TeamOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  CheckCircleOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { Vendor } from '@emprise/shared/src/types/master';
import { masterDataApi } from '../services/masterDataApi';
import { SearchHeader } from '../components/SearchHeader';
import { VendorMasterForm } from '../components/VendorMasterForm';
import { StatusBadge } from '../components/StatusBadge';
import { useMasterData } from '../hooks/useMasterData';

const { Title, Text } = Typography;

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

  const getStatistics = () => {
    if (!vendors) return { total: 0, active: 0, categories: 0 };
    const activeVendors = vendors.filter(v => v.isActive);
    const uniqueCategories = new Set(vendors.flatMap(v => v.category));
    return {
      total: vendors.length,
      active: activeVendors.length,
      categories: uniqueCategories.size
    };
  };

  const stats = getStatistics();

  const columns = [
    {
      title: (
        <Space>
          <UserOutlined className="text-gray-400" />
          Name
        </Space>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Text className="font-medium">{text}</Text>
      ),
    },
    {
      title: (
        <Space>
          <MailOutlined className="text-gray-400" />
          Email
        </Space>
      ),
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => (
        <Text className="text-blue-600">{text}</Text>
      ),
    },
    {
      title: (
        <Space>
          <PhoneOutlined className="text-gray-400" />
          Phone
        </Space>
      ),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: (
        <Space>
          <BankOutlined className="text-gray-400" />
          Category
        </Space>
      ),
      dataIndex: 'category',
      key: 'category',
      render: (categories: string[]) => (
        <Space wrap>
          {categories.map(cat => (
            <Tag key={cat} className="m-0">
              {cat}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined className="text-gray-400" />
          Status
        </Space>
      ),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} type="status" />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Vendor) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details'
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => {
                  setEditingVendor(record);
                  form.setFieldsValue(record);
                  setModalVisible(true);
                }
              }
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} className="!mb-1">Vendor Master</Title>
          <Text type="secondary">Manage and track vendor information</Text>
        </div>
      </div>

      {/* Statistics Section */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card loading={loading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <TeamOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
              <Statistic
                title="Total Vendors"
                value={stats.total}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircleOutlined className="text-2xl mr-3 p-2 rounded-lg bg-green-50 text-green-500" />
              <Statistic
                title="Active Vendors"
                value={stats.active}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <BankOutlined className="text-2xl mr-3 p-2 rounded-lg bg-orange-50 text-orange-500" />
              <Statistic
                title="Categories"
                value={stats.categories}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card className="shadow-sm">
        <SearchHeader
          onSearch={handleSearch}
          onAdd={() => {
            setEditingVendor(null);
            form.resetFields();
            setModalVisible(true);
          }}
          addButtonText="Add Vendor"
          searchPlaceholder="Search by name, email or phone..."
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
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} vendors`
          }}
          onChange={handleTableChange}
          rowKey="id"
          className="border border-gray-200 rounded-lg overflow-hidden"
        />
      </Card>

      {/* Form Modal */}
      <Modal
        title={
          <Space>
            {editingVendor ? <EditOutlined /> : <PlusOutlined />}
            {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
          </Space>
        }
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
    </div>
  );
};

export default VendorMasterPage;