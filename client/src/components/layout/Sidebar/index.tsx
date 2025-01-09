import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  BankOutlined,
  DatabaseOutlined,
  PercentageOutlined,
  FormOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  FundOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import Logo from '../../shared/Logo';
import { useState } from 'react';

// interface SidebarProps {
//   collapsed: boolean;
// }

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Function to get selected keys based on current path
  const getSelectedKeys = () => {
    const path = location.pathname;
    // Match budgetary offers paths
    if (path.startsWith('/budgetary-offers')) {
      if (path === '/budgetary-offers') return ['bo-dashboard'];
      if (path === '/budgetary-offers/create') return ['bo-create'];
      if (path.includes('/budgetary-offers/edit/')) return ['bo-list'];
      if (path.includes('/budgetary-offers/view/')) return ['bo-list'];
      return ['bo-list'];
    }
    if (path.startsWith('/purchase-orders')) {
      if (path === '/purchase-orders') return ['po-dashboard'];
      if (path === '/purchase-orders/create') return ['po-create'];
      if (path.includes('/purchase-orders/edit/')) return ['po-list'];
      if (path.includes('/purchase-orders/view/')) return ['po-list'];
      return ['po-list'];
    }
    // Match other paths
    if (path.startsWith('/master-data/items')) return ['master-data-items'];
    if (path.startsWith('/master-data/vendors')) return ['master-data-vendors'];
    return [path.split('/')[1] || 'dashboard'];
  };

  // Function to get open submenu keys
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/master-data')) return ['master-data'];
    if (path.startsWith('/budgetary-offers')) return ['budgetary-offers'];
    if (path.startsWith('/purchase-orders')) return ['purchase-orders'];
    return [];
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: 'budgetary-offers',
      icon: <FormOutlined />,
      label: 'Budgetary Offers',
      children: [
        {
          key: 'bo-dashboard',
          icon: <FundOutlined />,
          label: <Link to="/budgetary-offers">BO Dashboard</Link>,
        },
        {
          key: 'bo-list',
          icon: <UnorderedListOutlined />,
          label: <Link to="/budgetary-offers/list">List All</Link>,
        },
        {
          key: 'bo-create',
          icon: <PlusOutlined />,
          label: <Link to="/budgetary-offers/create">Create New</Link>,
        },
      ],
    },
    {
      key: 'purchase-orders',
      icon: <ShoppingCartOutlined />,
      label: 'Purhcase Orders',
      children: [
        {
          key: 'po-dashboard',
          icon: <FundOutlined />,
          label: <Link to="/purchase-orders">PO Dashboard</Link>,
        },
        {
          key: 'po-create',
          icon: <PlusOutlined />,
          label: <Link to="/purchase-orders/create">Create new PO</Link>,
        }
      ]
    },
    {
      key: 'loa-management',
      icon: <BankOutlined />,
      label: <Link to="/loa-management">LOA Management</Link>,
    },
    {
      key: 'emd-tracking',
      icon: <PercentageOutlined />,
      label: <Link to="/emd-tracking">EMD Tracking</Link>,
    },
    {
      key: 'master-data',
      label: 'Master Data',
      icon: <DatabaseOutlined />,
      children: [
        {
          key: 'master-data-dashboard',
          label: <Link to="/master-data">Dashboard</Link>,
        },
        {
          key: 'master-data-items',
          label: <Link to="/master-data/items">Item Master</Link>,
        },
        {
          key: 'master-data-vendors',
          label: <Link to="/master-data/vendors">Vendor Master</Link>,
        },
      ],
    },
  ];

  return (
    <Layout.Sider
      collapsed={collapsed}
      className="min-h-screen bg-white border-r border-gray-200"
      width={280}
      collapsedWidth={80}
      trigger={null}
    >
      <div className="flex flex-col h-screen">
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-center border-b border-gray-200">
          <Logo collapsed={collapsed} />
        </div>
        
        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            items={menuItems}
            className="border-r-0"
          />
        </div>

        {/* Collapse Toggle Button */}
        <div 
          onClick={toggleCollapsed}
          className="h-14 flex items-center justify-center cursor-pointer bg-blue-600 hover:bg-blue-700"
        >
          {collapsed ? (
            <MenuUnfoldOutlined className="text-white text-lg" />
          ) : (
            <MenuFoldOutlined className="text-white text-lg" />
          )}
        </div>
      </div>
    </Layout.Sider>
  );
};



export default Sidebar;