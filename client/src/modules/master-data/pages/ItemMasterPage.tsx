// src/modules/master-data/pages/ItemMasterPage.tsx
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
  Dropdown
} from 'antd';
import { 
  PlusOutlined,
  DatabaseOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { ItemMaster } from '../../../types/master';
import { masterDataApi } from '../services/masterDataApi';
import { SearchHeader } from '../components/SearchHeader';
import { ItemMasterForm } from '../components/ItemMasterForm';
import { StatusBadge } from '../components/StatusBadge';
import { useMasterData } from '../hooks/useMasterData';

const { Title, Text } = Typography;

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

  const getStatistics = () => {
    const activeItems = items?.filter(item => item.isActive) || [];
    return {
      total: items?.length || 0,
      active: activeItems.length,
      categories: new Set(items?.map(item => item.category)).size
    };
  };

  const stats = getStatistics();

  const columns = [
    {
      title: (
        <Space>
          <FileTextOutlined className="text-gray-400" />
          Item Code
        </Space>
      ),
      dataIndex: 'itemCode',
      key: 'itemCode',
      render: (text: string) => (
        <Text className="font-medium">{text}</Text>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined className="text-gray-400" />
          Description
        </Space>
      ),
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate max-w-[300px]">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: (
        <Space>
          <DatabaseOutlined className="text-gray-400" />
          Category
        </Space>
      ),
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: (
        <Space>
          <DatabaseOutlined className="text-gray-400" />
          Unit
        </Space>
      ),
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined className="text-gray-400" />
          Status
        </Space>
      ),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <StatusBadge status={isActive} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ItemMaster) => (
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
                  setEditingItem(record);
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
          <Title level={4} className="!mb-1">Item Master</Title>
          <Text type="secondary">Manage and track inventory items</Text>
        </div>
      </div>

      {/* Statistics Section */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card loading={loading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <DatabaseOutlined className="text-2xl mr-3 p-2 rounded-lg bg-blue-50 text-blue-500" />
              <Statistic
                title="Total Items"
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
                title="Active Items"
                value={stats.active}
                className="flex-1"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading} className="hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <DatabaseOutlined className="text-2xl mr-3 p-2 rounded-lg bg-orange-50 text-orange-500" />
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
            setEditingItem(null);
            form.resetFields();
            setModalVisible(true);
          }}
          addButtonText="Add Item"
          searchPlaceholder="Search by item code or description..."
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
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`
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
            {editingItem ? <EditOutlined /> : <PlusOutlined />}
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <ItemMasterForm
          form={form}
          initialValues={editingItem || {}}
        />
      </Modal>
    </div>
  );
};

export default ItemMasterPage;